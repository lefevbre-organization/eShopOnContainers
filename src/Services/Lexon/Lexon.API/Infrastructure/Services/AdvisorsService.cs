using Lexon.API;
using Lexon.API.Infrastructure.Exceptions;
using Lexon.API.Infrastructure.Repositories;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public class AdvisorsService : LexonBaseClass<AdvisorsService>, IAdvisorsService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;
        private string _urlLexon;

        public AdvisorsService(
                IOptions<LexonSettings> settings
                , IUsersRepository usersRepository
                , IEventBus eventBus
                , ILogger<AdvisorsService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            ConfigureByEnv(null, null, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.Generic);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler) { BaseAddress = new Uri(_urlLexon) };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }
    
        #region Advisors

 
        public async Task<Result<PaginatedItemsViewModel<LexAdvisorFile>>> GetAdvisorsFilesAsync(string env, string idUser, string bbdd, string email, int pageIndex, int pageSize)
        {
            var result = new Result<PaginatedItemsViewModel<LexAdvisorFile>>(new PaginatedItemsViewModel<LexAdvisorFile>(pageIndex, pageSize, 0, new List<LexAdvisorFile>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonAdvisors.GetAdvisorFiles);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetMailFilter(idUser, bbdd, email);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(pageSize, pageIndex, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonAdvisors.GetAdvisorFiles, nameof(GetAdvisorsFilesAsync));

                        using (var reader = await command.ExecuteReaderAsync())
                        {

                            while (reader.Read())
                            {
                                var rawJson = reader.GetValue(0).ToString();
                                var resultado = (JsonConvert.DeserializeObject<LexAdvisorFile[]>(rawJson)).ToList();
                                result.data = new PaginatedItemsViewModel<LexAdvisorFile>(pageIndex, pageSize, GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value), resultado);
                            }

                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when get advisor files", ex), Codes.LexonAdvisors.GetAdvisorFiles, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetActuationCategoriesMongoAsync(result);
            }

            return result;
        }

        public async Task<Result<PaginatedItemsViewModel<LexContact>>> GetAdvisorsContact(string env, string idUser, string bbdd, string email, int pageIndex, int pageSize)
        {
            var result = new Result<PaginatedItemsViewModel<LexContact>>(new PaginatedItemsViewModel<LexContact>(pageIndex, pageSize, 0, new List<LexContact>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonAdvisors.GetAdvisorContacts);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetMailFilter(idUser, bbdd, email);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetAllContacts, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(pageSize, pageIndex, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonAdvisors.GetAdvisorContacts, nameof(GetAdvisorsContact));

                        using (var reader = await command.ExecuteReaderAsync())
                        {

                            while (reader.Read())
                            {
                                var rawJson = reader.GetValue(0).ToString();
                                var resultado = (JsonConvert.DeserializeObject<LexContact[]>(rawJson)).ToList();
                                result.data = new PaginatedItemsViewModel<LexContact>(pageIndex, pageSize, GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value), resultado);
                            }

                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when get advisor files", ex), Codes.LexonAdvisors.GetAdvisorContacts, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetActuationCategoriesMongoAsync(result);
            }

            return result;
        }


        #endregion Advisors

    }
}