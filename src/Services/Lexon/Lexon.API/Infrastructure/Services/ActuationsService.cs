using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public class ActuationsService : BaseClass<ActuationsService>, IActuationsService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;
        private string _urlLexon;

        public ActuationsService(
                IOptions<LexonSettings> settings
                , IUsersRepository usersRepository
                , IEventBus eventBus
                , ILogger<ActuationsService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            ConfigureByEnv(null, null, _settings.Value, out _conn, out _urlLexon);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler) { BaseAddress = new Uri(_urlLexon) };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        //private void GetUrlsByEnvironment(string env, List<Info> infos)
        //{
        //    if (env == null || !_settings.Value.Environments.Contains(env))
        //    {
        //        if (infos != null)
        //            TraceInfo(infos, $"Received {env} - Get Default Env {_settings.Value.DefaultEnvironment}");
        //        env = _settings.Value.DefaultEnvironment;
        //    }
        //    else
        //    {
        //        if (infos != null)
        //            TraceInfo(infos, $"Received {env} from client");
        //    }

        //    _conn = _settings.Value.envModels.First(x => x.env.Equals(env))?.conn;
        //    _urlLexon = _settings.Value.envModels.First(x => x.env.Equals(env))?.url;
        //}


        #region Common

        private void AddCommonParameters(string idUser, MySqlCommand command, string nameFilter = "P_FILTER", string filterValue = "{}", bool addParameterId = false)
        {
            command.Parameters.Add(new MySqlParameter(nameFilter, MySqlDbType.String) { Value = filterValue });
            command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
            command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
            command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
            if (addParameterId)
                command.Parameters.Add(new MySqlParameter("P_ID", MySqlDbType.Int32) { Direction = ParameterDirection.Output });

            command.CommandType = CommandType.StoredProcedure;

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{command.CommandText} {nameFilter}='{filterValue}', P_UC={idUser}" });
        }

        private void AddListSearchParameters(int pageSize, int pageIndex, string fieldOrder, string order, MySqlCommand command)
        {
            TraceLog(parameters: new string[] { $"P_PAGE_SIZE:{pageSize} - P_PAGE_NUMBER:{pageIndex} - P_ORDER:{fieldOrder} - P_TYPE_ORDER:{order}" });

            command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
            command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
            command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
            if (!string.IsNullOrEmpty(fieldOrder))
                command.Parameters.Add(new MySqlParameter("P_ORDER", MySqlDbType.String) { Value = fieldOrder });
            if (!string.IsNullOrEmpty(order))
                command.Parameters.Add(new MySqlParameter("P_TYPE_ORDER", MySqlDbType.String) { Value = order });
        }

        private int EvaluateErrorCommand(List<ErrorInfo> errors, MySqlCommand command)
        {
            int idError = 0;
            if (command.Parameters["P_IDERROR"].Value is int)
            {
                int.TryParse(command.Parameters["P_IDERROR"].Value.ToString(), out idError);
                TraceOutputMessage(errors, command.Parameters["P_ERROR"].Value, null, idError);
            }

            return idError;
        }

 
        private string GiveMeRelationFilter(string bbdd, string idUser, MailInfo mailInfo, short? idType, long? idRelated, string[] contactList)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetRelationByIdFilter(idType, idRelated) +
                GetMailFilter(mailInfo) +
                GetContactList("ContactList", contactList) +
                $" }}";
        }

        private string GetContactList(string name, string[] list, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return list != null ? $"{comma}\"{name}\":{JsonConvert.SerializeObject(list)}" : string.Empty;
        }

 
        private string GiveMeAppointmentFilter(string idUser, LexAppointment appointment)
        {
            return $"{{ " +
                GetUserFilter(appointment.Bbdd, idUser) +
                GetAppointmentFilter(appointment) +
                $" }}";
        }

        private string GiveMeAppointmentRemoveFilter(string idUser, LexAppointmentSimple appointment)
        {
            return $"{{ " +
                GetUserFilter(appointment.Bbdd, idUser) +
                GetAppointmentFilter(appointment) +
                $" }}";
        }

        private string GiveMeAppointmentActionFilter(string idUser, LexAppointmentActuation appointment)
        {
            return $"{{ " +
                GetUserFilter(appointment.Bbdd, idUser) +
                GetAppointmentActionFilter(appointment) +
                $" }}";
        }

        private string GetAppointmentFilter(LexAppointment appointment)
        {
            //'{"BBDD":"lexon_admin_02","IdUser":1344, "Subject":"test cita", "Location":"Madrid", "EndDate":"2020-03-30 20:31:30", "StartDate":"2020-03-28 20:31:30"}';
            return $"{GetTextFilter("Subject", appointment.Subject)}" +
                $"{GetTextFilter("Provider", appointment.Provider)}" +
                $"{GetTextFilter("Location", appointment.Location)}" +
                $"{GetTextFilter("StartDate", appointment.StartDate)}" +
                $"{GetTextFilter("EndDate", appointment.EndDate)}";
        }

        private string GetAppointmentFilter(LexAppointmentSimple appointment)
        {
            //'{"BBDD":"lexon_admin_02","Id":401, "IdUser":"1344"}';
            return $"{GetLongFilter("Id", appointment.Id)}";
        }

        private string GetAppointmentActionFilter(LexAppointmentActuation appointment)
        {
            //'{"BBDD":"lexon_admin_02","IdUser":1344, "idAppointment":402, "id":917}
            return $"{GetLongFilter("Id", appointment.Id)}" +
                $"{GetLongFilter("idAppointment", appointment.IdAppointment)}" ;
        }

        private static string GetUserFilter(string bbdd, string idUser, bool withComma = false)
        {
            var comma = withComma ? ", " : "";
            return $"{comma}\"BBDD\":\"{bbdd}\",\"IdUser\":{idUser}";
        }

        private string GetMailFilter(MailInfo mail)
        {
            return $"{GetTextFilter("Provider", mail.Provider)}" +
                $"{GetTextFilter("MailAccount", mail.MailAccount)}" +
                $"{GetTextFilter("Uid", mail.Uid)}" +
                $"{GetTextFilter("Subject", mail.Subject)}" +
                $"{GetTextFilter("Folder", mail.Folder)}" +
                $"{GetTextFilter("Date", mail.Date)}";
        }

         private string GetMailListFilter(string name, MailInfo[] mailInfoList, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return $"{comma}\"{name}\":{JsonConvert.SerializeObject(mailInfoList)}";
        }

        private string GetRelationByIdFilter(short? idType, long? idRelated)
        {
            return idType != null && idRelated != null
                ? $"{GetShortFilter("IdActionRelationType", idType)}{GetLongFilter("IdRelation", idRelated)}"
                : string.Empty;
        }

 
        private string GetLongFilter(string name, long? param, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            var paramString = param == null ? "null" : param.ToString();
            return param != null ? $"{comma}\"{name}\":{paramString}" : string.Empty;
        }

        private string GetShortFilter(string name, short? param, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            var paramString = param == null ? "null" : param.ToString();
            return $"{comma}\"{name}\":{paramString}";
        }

        private string GetTextFilter(string name, string value, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return !string.IsNullOrEmpty(value) ? $"{comma}\"{name}\":\"{value}\"" : string.Empty;
        }

        #endregion Common


        #region Actuations

        public async Task<Result<int>> AddAppointmentAsync(LexAppointment appointment, string env, string idUser)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeAppointmentFilter(idUser, appointment);
                    conn.Open();

                        using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAppointment, conn))
                        {
                            AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                            await command.ExecuteNonQueryAsync();
                            TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            result.data =(GetIntOutputParameter(command.Parameters["P_ID"].Value));
                        }
                 }

                if (_settings.Value.UseMongo)
                {
                    //if (result.data > 0)
                    //    await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<int>> RemoveAppointmentAsync(LexAppointmentSimple appointment, string env, string idUser)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeAppointmentRemoveFilter(idUser, appointment);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveAppointment, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data == 0)
                    TraceOutputMessage(result.errors, "Mysql don´t remove the classification", null, "MySql Remove Data");
                //else
                //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);
            }
            return result;
        }

        public async Task<Result<int>> AddAppointmentActionAsync(LexAppointmentActuation appointment, string env, string idUser)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeAppointmentActionFilter(idUser, appointment);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAppointmentAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                        result.data = (GetIntOutputParameter(command.Parameters["P_ID"].Value));
                    }
                }

                if (_settings.Value.UseMongo)
                {
                    //if (result.data > 0)
                    //    await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public Task<Result<PaginatedItemsViewModel<LexActuationType>>> GetMasterActuationsAsync(string env)
        {
            throw new NotImplementedException();
        }

        public Task<Result<PaginatedItemsViewModel<LexActuation>>> GetActuationsAsync(string idType, string idUser, string env, int pageSize, int pageIndex)
        {
            throw new NotImplementedException();
        }

        public Task<Result<PaginatedItemsViewModel<LexActuation>>> GetClassificationsFromAppointmentAsync(string idType, string idUser, string env, int pageSize, int pageIndex)
        {
            throw new NotImplementedException();
        }

        public Task<Result<PaginatedItemsViewModel<LexActuationCategory>>> GetActuationCategoriesAsync(string env)
        {
            throw new NotImplementedException();
        }

        #endregion Actuations
    }
}