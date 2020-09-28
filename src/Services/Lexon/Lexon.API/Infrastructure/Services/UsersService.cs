using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
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
    public class UsersService : BaseClass<UsersService>, IUsersService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;
        private string _urlLexon;

        public UsersService(
                IOptions<LexonSettings> settings
                , IUsersRepository usersRepository
                , IEventBus eventBus
                , ILogger<UsersService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            GetUrlsByEnvironment(null, null);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler) { BaseAddress = new Uri(_urlLexon) };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        private void GetUrlsByEnvironment(string env, List<Info> infos)
        {
            if (env == null || !_settings.Value.Environments.Contains(env))
            {
                if (infos != null)
                    TraceInfo(infos, $"Received {env} - Get Default Env {_settings.Value.DefaultEnvironment}");
                env = _settings.Value.DefaultEnvironment;
            }
            else
            {
                if (infos != null)
                    TraceInfo(infos, $"Received {env} from client");
            }

            _conn = _settings.Value.LexonUrls.First(x => x.env.Equals(env))?.conn;
            _urlLexon = _settings.Value.LexonUrls.First(x => x.env.Equals(env))?.url;
        }

        #region user

        public async Task<Result<LexUser>> GetUserAsync(string idNavisionUser, string env)
        {
            var result = new Result<LexUser>(new LexUser());
            GetUrlsByEnvironment(env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    //TODO: Delete token of user
                    var filtro = $"{{\"NavisionId\":\"{idNavisionUser}\"}}";
                    await GetUserCommon(result, conn, filtro);
                    await AddTokenProvisional(result, idNavisionUser);
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (!string.IsNullOrEmpty(result.data?.name))
                {
                    await _usersRepository.UpsertUserAsync(result);
                }
                else
                {
                    TraceOutputMessage(result.errors, "Mysql don´t recover the user", null, "Mysql_Empty");
                    var resultMongo = await _usersRepository.GetUserAsync(idNavisionUser);
                    AddToFinalResult(result, resultMongo);
                }
            }
            return result;
        }

        private static void AddToFinalResult(Result<LexUser> result, Result<LexUser> resultPreview)
        {
            result.errors.AddRange(resultPreview.errors);
            result.infos.AddRange(resultPreview.infos);
            result.data = resultPreview.data;
        }

        public async Task<Result<List<LexCompany>>> GetCompaniesFromUserAsync(string idUser, string env)
        {
            var result = new Result<List<LexCompany>>(new List<LexCompany>());
            var resultUser = new Result<LexUser>(new LexUser());
            GetUrlsByEnvironment(env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"IdUser\":\"{idUser}\"}}";
                    await GetUserCommon(resultUser, conn, filtro);
                    AddToFinalResult(result, resultUser);
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data?.Count > 0)
                {
                    await _usersRepository.UpsertCompaniesAsync(result, idUser);
                }
                else
                {
                    TraceOutputMessage(result.errors, "Mysql don´t recover the user with companies", null, "Mysql Recover");
                    var resultMongo = await _usersRepository.GetUserAsync(idUser);
                    AddToFinalResult(result, resultMongo);
                }
            }
            return result;
        }

        private static void AddToFinalResult(Result<List<LexCompany>> result, Result<LexUser> resultPreliminar)
        {
            result.errors.AddRange(resultPreliminar.errors);
            result.infos.AddRange(resultPreliminar.infos);
            result.data = resultPreliminar.data?.companies?.ToList();
        }

        private async Task GetUserCommon(Result<LexUser> result, MySqlConnection conn, string filtro)
        {
            conn.Open();
            using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
            {
                AddCommonParameters("0", command, "P_FILTER", filtro);
                AddListSearchParameters(0, 1, null, null, command);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                    if (EvaluateErrorCommand(result.errors, command) == 0)
                        while (reader.Read())
                        {
                            var rawJson = reader.GetValue(0).ToString();
                            result.data = JsonConvert.DeserializeObject<LexUser>(rawJson);
                            
                        }
                }
            }
        }

        private async Task AddTokenProvisional(Result<LexUser> resultado, string idUser)
        {
            resultado.data.token = BuildTokenWithPayloadAsync(new TokenModel
            {
                idClienteNavision = idUser,
                name = resultado?.data?.name,
                idUserApp = GetLongIdUser(resultado?.data?.idUser),
                //bbdd = bbdd,
                //provider = provider,
                //mailAccount = mailAccount,
                //folder = folder,
                //idMail = uidMail,
                //idEntityType = idEntityType,
                //idEntity = idEntity,
                //mailContacts = mailContacts,
                roles = await GetRolesOfUserAsync(idUser, null, null)
            }).Result;
        }

        private long? GetLongIdUser(string idUser)
        {
            long.TryParse(idUser, out long idUserLong);
            return idUserLong;
        }
        /// <summary>
        ///   Se crea el claim a pelo como en el ejemplo https://stackoverflow.com/questions/29715178/complex-json-web-token-array-in-webapi-with-owin
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public async Task<string> BuildTokenWithPayloadAsync(TokenModel token)
        {
            var accion = await Task.Run(() =>
            {
                //_logger.LogInformation("START --> {0} con tiempo {1} y caducidad token {2}", nameof(BuildTokenWithPayloadAsync), DateTime.Now, DateTime.Now.AddSeconds(_settings.Value.TokenCaducity));

                var exp = DateTime.UtcNow.AddSeconds(1500);
                var payload = new JwtPayload(null, "", new List<Claim>(), null, exp);

                AddValuesToPayload(payload, token);

                var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9"));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var jwtToken = new JwtSecurityToken(new JwtHeader(creds), payload);
                return new JwtSecurityTokenHandler().WriteToken(jwtToken);
            });

            //_logger.LogInformation("END --> {0} con token: {1}", nameof(BuildTokenWithPayloadAsync), accion);

            return accion;
        }

        private void AddValuesToPayload(JwtPayload payload, TokenModel modelo)
        {
            if (modelo is TokenModel clienteModel)
            {
                //var roleOptions = GetRolesOfUser(clienteModel.idClienteNavision);
                AddClaimToPayload(payload, clienteModel.idClienteNavision, nameof(clienteModel.idClienteNavision));
                AddClaimToPayload(payload, clienteModel.idUserApp, nameof(clienteModel.idUserApp));
                AddClaimToPayload(payload, clienteModel.name, nameof(clienteModel.name));
                AddClaimToPayload(payload, clienteModel.bbdd, nameof(clienteModel.bbdd));
                AddClaimToPayload(payload, clienteModel.provider, nameof(clienteModel.provider));
                AddClaimToPayload(payload, clienteModel.mailAccount, nameof(clienteModel.mailAccount));
                AddClaimToPayload(payload, clienteModel.folder, nameof(clienteModel.folder));
                AddClaimToPayload(payload, clienteModel.idMail, nameof(clienteModel.idMail));
                AddClaimToPayload(payload, clienteModel.idEntityType, nameof(clienteModel.idEntityType));
                AddClaimToPayload(payload, clienteModel.idEntity, nameof(clienteModel.idEntity));
                AddClaimToPayload(payload, clienteModel.roles, nameof(clienteModel.roles));
                AddClaimToPayload(payload, clienteModel.mailContacts, nameof(clienteModel.mailContacts));
            }
        }

        private void AddClaimToPayload(JwtPayload payload, object valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            //_logger.LogInformation("Claim {0} --> {1}", nombreClaim, valorClaim);
            payload.Add(nombreClaim, valorClaim);
        }

        private async Task<List<string>> GetRolesOfUserAsync(string idClienteNavision, string login, string password)
        {
            //var apps = await GetUserMiniHubAsync(idClienteNavision);
            var appsWithAccess = new List<string>() { "lexonconnector", "centinelaconnector" };
            //foreach (var app in apps.data)
            //{
            //    appsWithAccess.Add(app.descHerramienta);
            //}

            var usuarioValido = !string.IsNullOrEmpty(login) && !string.IsNullOrEmpty(password);
            if (!string.IsNullOrEmpty(idClienteNavision) && usuarioValido)
            {
                appsWithAccess.Add("gmailpanel");
                appsWithAccess.Add("outlookpanel");
            }

            return appsWithAccess;
        }


        public async Task<Result<LexUserSimple>> GetUserIdAsync(string idNavisionUser, string env)
        {
            var result = new Result<LexUserSimple>(new LexUserSimple());
            GetUrlsByEnvironment(env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"NavisionId\":\"{idNavisionUser}\",\"User\":1}}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, null, null, command);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    result.data = JsonConvert.DeserializeObject<LexUserSimple>(rawJson);
                                    result.data.idNavision = idNavisionUser;
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        #endregion user

        #region Classifications

        public async Task<Result<List<int>>> AddClassificationToListAsync(ClassificationAddView classificationAdd)
        {
            var result = new Result<List<int>>(new List<int>());
            GetUrlsByEnvironment(classificationAdd.env, result.infos);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    conn.Open();
                    foreach (var mail in classificationAdd.listaMails)
                    {
                        mail.Subject = RemoveProblematicChars(mail.Subject);
                        var listaUnicaMails = new MailInfo[] { mail };
                        var filtro = GiveMeRelationMultipleFilter(classificationAdd.bbdd, classificationAdd.idUser, listaUnicaMails, classificationAdd.idType, classificationAdd.idRelated);

                        using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                        {
                            AddCommonParameters(classificationAdd.idUser, command, "P_JSON", filtro, true);
                            await command.ExecuteNonQueryAsync();
                            TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            result.data.Add(GetIntOutputParameter(command.Parameters["P_ID"].Value));
                        }
                    }
                }

                if (_settings.Value.UseMongo)
                {
                    if (result.data?.Count > 0)
                        await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        private async Task AddClassificationToListMongoAsync(ClassificationAddView classificationAdd, Result<List<int>> result)
        {
            try
            {
                var resultMongo = await _usersRepository.AddClassificationToListAsync(classificationAdd);

                if (resultMongo.infos.Count > 0)
                    result.infos.AddRange(resultMongo.infos);
                else if (resultMongo.data == 0)
                    result.infos.Add(new Info() { code = "error_actuation_mongo", message = "error when add classification" });
                else
                    result.infos.Add(new Info() { code = "add_actuations_mong", message = "add classification to mongo" });

            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al añadir actuaciones para  {classificationAdd.idRelated}: {ex.Message}");
            }
        }

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        {
            var result = new Result<int>(0);
            GetUrlsByEnvironment(classification.env, result.infos);

            classification.mail.Subject = RemoveProblematicChars(classification.mail.Subject);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    string filtro = GiveMeRelationFilter(classification.bbdd, classification.idUser, classification.mail, null, null, classification.ContactList);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddContactRelations, conn))
                    {
                        AddCommonParameters(classification.idUser, command, "P_JSON", filtro);
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
                if (result.data == 1)
                {
                    //await AddClassificationToListMongoAsync(classification, result) idUser, bbdd, listaMails, idRelated, idType, result);
                    //await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            return result;
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove)
        {
            var result = new Result<long>(0);
            GetUrlsByEnvironment(classificationRemove.env, result.infos);

            var mailInfo = new MailInfo(classificationRemove.Provider, classificationRemove.MailAccount, classificationRemove.idMail);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeRelationFilter(classificationRemove.bbdd, classificationRemove.idUser, mailInfo, classificationRemove.idType, classificationRemove.idRelated, null);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveRelation, conn))
                    {
                        AddCommonParameters(classificationRemove.idUser, command, "P_JSON", filtro);
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

        //private async Task RemoveClassificationFromListMongoAsync(ClassificationRemoveView classificationRemove, Result<long> result)
        //{
        //    try
        //    {
        //        var resultMongo = await _usersRepository.RemoveClassificationFromListAsync(classificationRemove);

        //        if (resultMongo.infos.Count > 0)
        //            result.infos.AddRange(resultMongo.infos);
        //        else if (resultMongo.data == 0)
        //            result.infos.Add(new Info() { code = "error_actuation_mongo", message = "error when remove classification" });
        //        else
        //            result.data = resultMongo.data;
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceInfo(result.infos, $"Error al eliminar actuaciones para  {classificationRemove.idRelated}: {ex.Message}");
        //    }
        //}

        public async Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classification)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchRelations, classification.pageIndex, classification.pageSize, classification.bbdd, classification.idType);
            GetUrlsByEnvironment(classification.env, resultMySql.Infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchRelationsFilter(classification.idType, classification.bbdd, classification.idUser, classification.idMail);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchRelations, conn))
                    {
                        AddCommonParameters(classification.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(classification.pageSize, classification.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = JsonConvert.DeserializeObject<LexMailActuation>(rawResult);
                                    resultMySql.AddRelationsMail(resultado);
                                }
                                else
                                {
                                    if (resultMySql.Infos.Count > 1)
                                        TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "MySql Recover");
                                    else
                                        resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(resultMySql.Errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (resultMySql.TengoActuaciones())
                    await _usersRepository.UpsertRelationsAsync(classification, resultMySql);
                else
                {
                    var resultMongo = await _usersRepository.GetRelationsAsync(classification);
                    resultMySql.DataActuation = resultMongo.DataActuation;
                }
            }

            return resultMySql;
        }

        public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchEntities, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);
            GetUrlsByEnvironment(entitySearch.env, resultMySql.Infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchEntitiesFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchEntities, conn))
                    {
                        AddCommonParameters(((EntitySearchView)entitySearch).idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(entitySearch.pageSize, entitySearch.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                    resultMySql.AddData(resultado);
                                }
                                else
                                {
                                    if (resultMySql.Infos.Count > 1)
                                        TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "MySql Recover");
                                    else
                                        resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(resultMySql.Errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (resultMySql.TengoLista())
                    await _usersRepository.UpsertEntitiesAsync(entitySearch, resultMySql);
                else
                {
                    var resultMongo = await _usersRepository.GetEntitiesAsync(entitySearch);
                    resultMySql.Data = resultMongo.Data;
                }
            }

            return resultMySql;
        }

        public async Task<Result<LexEntity>> GetEntityById(EntitySearchById entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.GetEntity, 1, 1, entitySearch.bbdd, entitySearch.idType);
            var result = new Result<LexEntity>(new LexEntity());
            GetUrlsByEnvironment(entitySearch.env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeEntityFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetEntity, conn))
                    {
                        AddCommonParameters(entitySearch.idUser, command, "P_FILTER", filtro);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                        resultMySql.AddData(resultado);
                                    }
                                    else
                                    {
                                        if (resultMySql.Infos.Count > 1)
                                            TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "MySql Recover");
                                        else
                                            resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                    }
                                }
                        }
                    }
                    result.data = resultMySql?.Data?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync(string env)
        {
            var resultMySql = new MySqlList<JosEntityTypeList, JosEntityType>(new JosEntityTypeList(), _settings.Value.SP.GetMasterEntities, 1, 0);
            GetUrlsByEnvironment(env, resultMySql.Infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = "{}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);

                        AddListSearchParameters(resultMySql.PageSize, resultMySql.PageIndex, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (resultMySql.PossibleHasData())
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<JosEntityTypeList>(rawJson));
                                    resultMySql.AddData(resultado, resultado.Entities);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(resultMySql.Errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetMasterEntitiesMongoAsync(resultMySql);
            }
            return resultMySql;
        }

        public async Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch)
        {
            var result = new Result<LexContact>(new LexContact());
            GetUrlsByEnvironment(entitySearch.env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeEntityFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetContact, conn))
                    {
                        AddCommonParameters(entitySearch.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        var lista = (JsonConvert.DeserializeObject<LexContact[]>(rawResult).ToList());
                                        result.data = lista?.FirstOrDefault();
                                    }
                                    else
                                    {
                                        TraceOutputMessage(result.errors, "MySql get and empty string with this search", null, "MySql Recover");
                                    }
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        public async Task<Result<List<LexContact>>> GetAllContactsAsync(BaseView search)
        {
            var result = new Result<List<LexContact>>(new List<LexContact>());
            GetUrlsByEnvironment(search.env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeBaseFilter(search.bbdd, search.idUser);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetAllContacts, conn))
                    {
                        AddCommonParameters(search.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        result.data = (JsonConvert.DeserializeObject<LexContact[]>(rawResult).ToList());
                                        CompleteContacts(search, result);
                                    }
                                    else
                                    {
                                        TraceOutputMessage(result.errors, "MySql get and empty string with this search", null, "2004");
                                    }
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }
            return result;
        }

        private void CompleteContacts(BaseView search, Result<List<LexContact>> result)
        {
            try
            {
                foreach (var contact in result.data)
                {
                    if (contact.IdType == null) continue;

                    contact.EntityType = contact.IdType != null ? Enum.GetName(typeof(LexonAdjunctionType), contact.IdType) : null;
                    contact.Tags = new string[] { search.bbdd, search.idUser, contact.EntityType };
                }
            }
            catch (Exception ex)
            {
                result.infos.Add(new Info() { code = "ErorCompleteContact", message = $"Error no controlado al completar datos del contacto + {ex.Message}" });
            }
        }

        public async Task<Result<LexUserSimpleCheck>> CheckRelationsMailAsync(string idUser, string env, MailInfo mail)
        {
            var result = new Result<LexUserSimpleCheck>(new LexUserSimpleCheck());
            GetUrlsByEnvironment(env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeCheckMailFilter(idUser, mail);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.CheckRelations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        result.data = (JsonConvert.DeserializeObject<LexUserSimpleCheck>(rawResult));
                                    }
                                    else
                                    {
                                        TraceOutputMessage(result.errors,  "MySql get and empty string with this search", null, "2004");
                                    }
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }
            return result;
        }

        #endregion Classifications

        #region Folders

        public async Task<MySqlCompany> GetEntitiesFoldersAsync(EntitySearchFoldersView entitySearch)
        {
            //si no se marcar nada o se marca idParent solo se buscan carpetas, si se pide idFolder e idPArent nunca sera carpetas
            if ((entitySearch.idFolder == null && entitySearch.idParent == null)
                || (entitySearch.idParent != null && entitySearch.idFolder == null))
                entitySearch.idType = (short?)LexonAdjunctionType.folders;
            else if (entitySearch.idFolder != null && entitySearch.idParent != null)
                entitySearch.idType = (short?)LexonAdjunctionType.documents;

            //var result = await GetEntitiesCommon(entitySearch, "/entities/folders/search");
            var result = await GetEntitiesAsync(entitySearch);

            if (entitySearch.idType == (short?)LexonAdjunctionType.files || entitySearch.idType == (short?)LexonAdjunctionType.folders)
            {
                result.Data = result.Data?.FindAll(entity => entity.idType == entitySearch.idType);
                result.Count = result.Data?.Count();
            };
            return result;
        }

        public async Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder)
        {
            var limit = entityFolder.nestedLimit <= 0 ? 2 : entityFolder.nestedLimit;

            var result = new Result<LexNestedEntity>(new LexNestedEntity());
            var search = new EntitySearchFoldersView(entityFolder.bbdd, entityFolder.idUser)
            {
                idParent = entityFolder.idFolder,
                search = entityFolder.search
            };
            if (entityFolder.includeFiles)
            {
                search.idFolder = entityFolder.idFolder;
            }
            else
            {
                search.idType = (short?)LexonAdjunctionType.folders;
            }

            var partialResultTop = await GetFoldersFilesEntitiesAsync(search);
            result.errors.AddRange(partialResultTop.Errors);
            result.infos.AddRange(partialResultTop.Infos);

            if (!partialResultTop.PossibleHasData())
            {
                result.infos.Add(new Info() { code = "noChilds", message = $"{entityFolder.idFolder} no tiene  folders anidados" });
                return result;
            }

            var itemParent = new LexNestedEntity(entityFolder);

            foreach (var item in partialResultTop.Data)
            {
                var entity = new LexNestedEntity(item);
                if (item.idType == (short?)LexonAdjunctionType.folders)
                    GetRecursiveFolder(entityFolder, result, entity, ref limit);
                itemParent.subChild.Add(entity);
            }

            result.data = itemParent;
            return result;
        }

        private void GetRecursiveFolder(FolderNestedView entityFolder, Result<LexNestedEntity> result, LexNestedEntity entity, ref int limit)
        {
            var search = new EntitySearchFoldersView(entityFolder.bbdd, entityFolder.idUser) { idParent = entity.idRelated };
            if (entityFolder.includeFiles)
            {
                search.idFolder = entity.idRelated;
            }
            else
            {
                search.idType = (short?)LexonAdjunctionType.folders;
            }

            var partialResult = GetFoldersFilesEntitiesAsync(search).Result;
            if (!partialResult.PossibleHasData())
                return;

            foreach (var item in partialResult.Data)
            {
                var nestedentity = new LexNestedEntity(item);
                GetRecursiveFolder(entityFolder, result, nestedentity, ref limit);
                entity.subChild.Add(nestedentity);
            };
            //limit -= 1;
        }

        public async Task<MySqlCompany> GetFoldersFilesEntitiesAsync(IEntitySearchView entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchFoldersFiles, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchEntitiesFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchFoldersFiles, conn))
                    {
                        AddCommonParameters(((EntitySearchView)entitySearch).idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(entitySearch.pageSize, entitySearch.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                    resultMySql.AddData(resultado);
                                }
                                else
                                {
                                    if (resultMySql.Infos.Count > 1)
                                        TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "MySql Recover");
                                    else
                                        resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity folderToEntity)
        {
            var result = new Result<long>(0);
            GetUrlsByEnvironment(folderToEntity.env, result.infos);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    string filtro = GeFolderCreateFilter(folderToEntity);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddEntityFolder, conn))
                    {
                        AddCommonParameters(folderToEntity.idUser, command, "P_JSON", filtro, true);

                        await command.ExecuteNonQueryAsync();
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                        result.data = GetIntOutputParameter(command.Parameters["P_ID"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        #endregion Folders
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

        private string GiveMeBaseFilter(string bbdd, string idUser)
        {
            return $"{{ {GetUserFilter(bbdd, idUser)} }}";
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

        private string GiveMeRelationMultipleFilter(string bbdd, string idUser, MailInfo[] listaMails, short? idType, long? idRelated)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetRelationByIdFilter(idType, idRelated) +
                GetMailListFilter("ListaMails", listaMails) +
                $" }}";
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

        private string GeFolderCreateFilter(FolderToEntity folderToEntity)
        {
            return $"{{ " +
                $"{GetTextFilter("BBDD", folderToEntity.bbdd, false)}" +
                $"{GetShortFilter("IdEntityType", folderToEntity.idType)}" +
                $"{GetLongFilter("IdParent", folderToEntity.IdParent)}" +
                $"{GetTextFilter("Name", folderToEntity.Name)}" +
                $"{GetLongFilter("IdRelated", folderToEntity.idEntity)}" +
                    $" }}";
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

        private string GiveMeSearchRelationsFilter(short? idType, string bbdd, string idUser, string idMail = "")
        {
            return $"{{ " +
                    GetUserFilter(bbdd, idUser) +
                    GetShortFilter("IdActionRelationType", idType) +
                    GetTextFilter("Uid", idMail) +
                    $" }}";
        }

        private string GiveMeSearchEntitiesFilter(IEntitySearchView search)
        {
            return $"{{ " +
                    GetUserFilter(((EntitySearchView)search).bbdd, ((EntitySearchView)search).idUser) +
                    GetShortFilter("IdEntityType", ((EntitySearchView)search).idType) +
                    GetTextFilter("Description", search.search) +
                    GetFolderDocumentFilter(search) +
                    $" }}";
        }

        private string GiveMeEntityFilter(EntitySearchById search)
        {
            return $"{{ " +
                    GetUserFilter(search.bbdd, search.idUser) +
                    GetShortFilter("IdEntityType", search.idType) +
                    GetLongFilter("IdRelation", search.idEntity) +
                    $" }}";
        }

        private string GetFolderDocumentFilter(IEntitySearchView search)
        {
            if (search is EntitySearchFoldersView || search == null)
                return $"{GetLongFilter("IdParent", (search as EntitySearchFoldersView)?.idParent)}{GetLongFilter("IdFolder", (search as EntitySearchFoldersView)?.idFolder)}";
            else if (search is EntitySearchDocumentsView)
                return $"{GetLongFilter("IdFolder", (search as EntitySearchDocumentsView)?.idFolder)}";

            return "";
        }

        private string GiveMeCheckMailFilter(string idUser, MailInfo mail)
        {
            return $"{{ " +
                    GetUserFilter(null, idUser) +
                    GetMailIdFilter(mail) +
                    $" }}";
        }

        private string GetMailIdFilter(MailInfo mail)
        {
            return $"{GetTextFilter("Provider", mail.Provider)}" +
                $"{GetTextFilter("MailAccount", mail.MailAccount)}" +
                $"{GetTextFilter("Uid", mail.Uid)}" +
                $"{GetTextFilter("Folder", mail.Folder)}";
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


        #region Files

        public async Task<Result<string>> FileGetAsync(EntitySearchById fileMail)
        {
            var result = new Result<string>(null);
            GetUrlsByEnvironment(fileMail.env, result.infos);
            try
            {
                var lexonFile = new LexonGetFile
                {
                    idCompany = await GetIdCompany(fileMail.idUser, fileMail.bbdd, fileMail.env),
                    idUser = fileMail.idUser,
                    idDocument = fileMail.idEntity ?? 0
                };

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);
                var url = $"{_urlLexon}?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}";
                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _clientFiles.GetAsync(url))
                {
                    WriteError($"Se recibe contestación {DateTime.Now}");

                    if (response.IsSuccessStatusCode)
                    {
                        var arrayFile = await response.Content.ReadAsByteArrayAsync();
                        var stringFile = Convert.ToBase64String(arrayFile);
                        var fileName = response.Content.Headers.ContentDisposition.FileName;
                        result.data = stringFile;
                        TraceInfo(result.infos, $"Se recupera el fichero:  {fileName}", lexonFile.idDocument.ToString());
                    }
                    else
                    {
                        var responseText = await response.Content.ReadAsStringAsync();
                        TraceOutputMessage(result.errors, $"Response not ok : {responseText} with lexon-dev with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", null, 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.idEntity}, -> {ex.Message}", ex.InnerException?.Message, "599");
            }

            WriteError($"Salimos de FileGetAsync a las {DateTime.Now}");
            return result;
        }
        public async Task<Result<bool>> FilePostAsync(MailFileView fileMail)
        {
            var result = new Result<bool>(false);
            GetUrlsByEnvironment(fileMail.env, result.infos);

            try
            {
                var lexonFile = await GetFileDataByTypeActuation(fileMail);
                lexonFile.fileName = RemoveProblematicChars(lexonFile.fileName);
                var name = Path.GetFileNameWithoutExtension(lexonFile.fileName);

                name = string.Concat(name.Split(Path.GetInvalidFileNameChars()));
                name = string.Concat(name.Split(Path.GetInvalidPathChars()));
                var maxlenght = name.Length > 55 ? 55 : name.Length;
                lexonFile.fileName = $"{name.Substring(0, maxlenght)}{Path.GetExtension(lexonFile.fileName)}";

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);

                SerializeObjectToPut(fileMail.ContentFile, $"?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}", out string url, out ByteArrayContent data);

                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _clientFiles.PutAsync(url, data))
                {
                    WriteError($"Se recibe contestación {DateTime.Now}");

                    var responseText = await response.Content.ReadAsStringAsync();
                    if (response.IsSuccessStatusCode)
                    {
                        result.data = true;
                        TraceInfo(result.infos, $"Se guarda el fichero {fileMail.Name} - {responseText}");
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, $"Response not ok with lexon-dev with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.Name}, -> {ex.Message}", ex.InnerException?.Message, "598");
            }
            WriteError($"Salimos de FilePostAsync a las {DateTime.Now}");

            return result;
        }

        private void SerializeObjectToPut(string textInBase64, string path, out string url, out ByteArrayContent byteArrayContent)
        {
            url = $"{_urlLexon}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            byte[] newBytes = Convert.FromBase64String(textInBase64);

            byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
        }

        private async Task<LexonPostFile> GetFileDataByTypeActuation(MailFileView fileMail)
        {
            var lexonFile = new LexonPostFile
            {
                idCompany = await GetIdCompany(fileMail.idUser, fileMail.bbdd, fileMail.env),
                fileName = fileMail.Name,
                idUser = fileMail.idUser,
                idEntityType = fileMail.idType ?? 0
            };
            if (fileMail.IdActuation == null || fileMail.IdActuation == 0)
            {
                lexonFile.idFolder = fileMail.IdParent ?? 0;
                lexonFile.idEntity = fileMail.idEntity ?? 0;
            }
            else
            {
                lexonFile.idFolder = 0;
                lexonFile.idEntity = (long)fileMail.IdActuation;
            };
            return lexonFile;
        }

        private async Task<long> GetIdCompany(string idUser, string bbdd, string env)
        {
            var resultadoCompanies = await GetCompaniesFromUserAsync(idUser, env);
            var companies = resultadoCompanies.data.Where(x => x.bbdd.ToLower().Contains(bbdd.ToLower()));
            var idCompany = companies?.FirstOrDefault()?.idCompany;
            return idCompany ?? 0; // "88";
        }


        #endregion Files

        #region Appointments

        public async Task<Result<int>> AddAppointmentAsync(LexAppointment appointment, string env, string idUser)
        {
            var result = new Result<int>(0);
            GetUrlsByEnvironment(env, result.infos);

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
            GetUrlsByEnvironment(env, result.infos);

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
            GetUrlsByEnvironment(env, result.infos);

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

        #endregion
    }
}