using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Exceptions;
    using Infrastructure.Repositories;
    using ViewModel;

    public class AdvisorsService : LexonBaseClass<AdvisorsService>, IAdvisorsService
    {
        public readonly IUsersRepository _usersRepository;
        public readonly IContactsService _svcContacts;
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
                , IContactsService svcContacts
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _svcContacts  = svcContacts ?? throw new ArgumentNullException(nameof(svcContacts));
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
            var result = new Result<PaginatedItemsViewModel<LexAdvisorFile>>(new PaginatedItemsViewModel<LexAdvisorFile>(pageIndex, pageSize));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonAdvisors.GetAdvisorFiles);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetMailFilter(idUser, bbdd, email);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetAdvisorFiles, conn))
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
            var resultado =  await _svcContacts.GetAllContactsAsync(env, idUser, bbdd, email, pageIndex, pageSize);
            TraceInfo(resultado.infos, $"The call to contacts is from {nameof(GetAdvisorsContact)}", Codes.LexonAdvisors.GetAdvisorContacts);
            return resultado;
        }


        #endregion Advisors

    }
}