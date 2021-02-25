using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
    using Lexon.API;
    using Infrastructure.Exceptions;
    using Infrastructure.Repositories;
    using ViewModel;
    using MySql.Data.MySqlClient;

    public class ContactsService : LexonBaseClass<ContactsService>, IContactsService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;
        private string _urlLexon;

        public ContactsService(
                IOptions<LexonSettings> settings
                , IUsersRepository usersRepository
                , IEventBus eventBus
                , ILogger<ContactsService> logger
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

        #region Contacts

        private void CompleteContacts(string idUser, string bbdd, Result<PaginatedItemsViewModel<LexContact>> result)
        {
            try
            {
                foreach (var contact in result.data.Data)
                {
                    if (contact.IdType == null) continue;

                    contact.EntityType = contact.IdType != null ? Enum.GetName(typeof(LexonAdjunctionType), contact.IdType) : null;
                    contact.Tags = new string[] { bbdd, idUser, contact.EntityType };
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error no controlado al completar datos del contacto + {ex.Message}", Codes.Lexon.GetAllContacts);
            }
        }

        public async Task<Result<int>> AddRelationContactsMailAsync(string env, string idUser, string bbdd, ContactsView classification)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.AddContactsToMail);

            try
            {
                classification.mail.Subject = RemoveProblematicChars(classification.mail.Subject);

                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    string filtro = GiveMeRelationFilter(bbdd, idUser, classification.mail, null, null, classification.ContactList);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddContactRelations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        CheckErrorOutParameters(command, result.errors, Codes.Lexon.AddContactsToMail, nameof(AddRelationContactsMailAsync));
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when add classification contacts", ex), Codes.Lexon.AddContactsToMail, "MYSQLCONN");
            }

            if (_settings.Value.UseMongo)
            {
                //TODO: Add relation contact to mongo
            }
            return result;
        }

        public async Task<Result<LexContact>> GetContactAsync(string env, string idUser, string bbdd, short idType, long idContact)
        {
            var result = new Result<LexContact>(new LexContact());
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetContact);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeEntityFilter(idUser, bbdd, idType, idContact);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetContact, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            CheckErrorOutParameters(command, result.errors, Codes.Lexon.GetContact, nameof(GetContactAsync));
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
                                    TraceError(result.errors, new LexonDomainException("MySql get and empty string with this search"), Codes.Lexon.GetContact, "MYSQL");
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when get contact", ex), Codes.Lexon.GetContact, "MYSQLCONN");
            }

            return result;
        }

        public async Task<Result<PaginatedItemsViewModel<LexContact>>> GetAllContactsAsync(string env, string idUser, string bbdd, string email, int pageIndex, int pageSize)
        {
            var result = new Result<PaginatedItemsViewModel<LexContact>>(new PaginatedItemsViewModel<LexContact>(pageIndex, pageSize));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetAllContacts);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GetMailFilter(idUser, bbdd, email);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetAllContacts, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(pageSize, pageIndex, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            CheckErrorOutParameters(command, result.errors, Codes.Lexon.GetAllContacts, nameof(GetAllContactsAsync));
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexContact[]>(rawResult).ToList());
                                    result.data = new PaginatedItemsViewModel<LexContact>(pageIndex, pageSize, GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value), resultado);
                                    CompleteContacts(idUser, bbdd, result);
                                }
                                else
                                {
                                    TraceError(result.errors, new LexonDomainException("MySql get and empty string with this search"), Codes.Lexon.GetAllContacts, "MYSQL");
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when get contacts", ex), Codes.Lexon.GetAllContacts, "MYSQLCONN");
            }
            return result;
        }

        #endregion Contacts
    }
}