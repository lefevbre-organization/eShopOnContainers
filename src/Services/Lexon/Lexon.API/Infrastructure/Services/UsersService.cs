using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
    using Infrastructure.Exceptions;
    using Infrastructure.Repositories;
    using Lexon.API;
    using Models;

    public class UsersService : LexonBaseClass<UsersService>, IUsersService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IContactsService _svcContacts;
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
                , IContactsService svcContacts

            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _svcContacts = svcContacts ?? throw new ArgumentNullException(nameof(svcContacts));
            ConfigureByEnv(null, null, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.Generic);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler) { BaseAddress = new Uri(_urlLexon) };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        #region user

        public async Task<Result<LexUser>> GetUserAsync(string idNavisionUser, string env)
        {
            var result = new Result<LexUser>(new LexUser());
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetUser);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"NavisionId\":\"{idNavisionUser}\"}}";
                    await GetUserCommon(result, conn, filtro);
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceError(result.errors, new LexonDomainException($"Error when get user of {idNavisionUser}", ex), Codes.Lexon.GetUser, "MYSQLCONN");
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
                    TraceError(result.errors, new LexonDomainException($"Mysql don´t recover the user {idNavisionUser}"), Codes.Lexon.GetUser, "MYSQLCONN");
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
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetCompaniesUser);

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
                    TraceError(result.errors, new LexonDomainException($"Error when get user companies of {idUser}", ex), Codes.Lexon.GetCompaniesUser, "MYSQL");
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
                    TraceError(result.errors, new LexonDomainException($"Mysql don´t recover the user with companies of {idUser}"), Codes.Lexon.GetCompaniesUser, "MYSQL");
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
                    CheckErrorOutParameters(command, result.errors, Codes.Lexon.GetUser, nameof(GetUserCommon));

                    if (EvaluateErrorCommand(result.errors, command) == 0)
                        while (reader.Read())
                        {
                            var rawJson = reader.GetValue(0).ToString();
                            result.data = JsonConvert.DeserializeObject<LexUser>(rawJson);
                        }
                }
            }
        }

        public async Task<Result<LexUserSimple>> GetUserIdAsync(string idNavisionUser, string env)
        {
            var result = new Result<LexUserSimple>(new LexUserSimple());
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetUserId);

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
                            CheckErrorOutParameters(command, result.errors, Codes.Lexon.GetUserId, nameof(GetUserIdAsync));
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
                    TraceError(result.errors, new LexonDomainException($"Error when get exon user id", ex), Codes.Lexon.GetUserId, "MYSQLCONN");
                }
            }

            return result;
        }

        #endregion user

        #region Classifications

        public async Task<Result<List<int>>> AddClassificationToListAsync(ClassificationAddView classificationAdd)
        {
            var result = new Result<List<int>>(new List<int>());
            ConfigureByEnv(classificationAdd.env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.AddClassificationToList);

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
                            CheckErrorOutParameters(command, result.errors, Codes.Lexon.AddClassificationToList, nameof(AddClassificationToListAsync));
                            result.data.Add(GetIntOutputParameter(command.Parameters["P_ID"].Value));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when add classification", ex), Codes.Lexon.AddClassificationToList, "MYSQLCONN");
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data?.Count > 0)
                    await AddClassificationToListMongoAsync(classificationAdd, result);
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
                    TraceInfo(result.infos, "error when add classification", Codes.Lexon.AddClassificationToList);
                else
                    TraceInfo(result.infos, "add classification", Codes.Lexon.AddClassificationToList);
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al añadir actuaciones para  {classificationAdd.idRelated}: {ex.Message}", Codes.Lexon.AddClassificationToList);
            }
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove)
        {
            var result = new Result<long>(0);
            ConfigureByEnv(classificationRemove.env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.RemoveClassificationFromList);

            var mailInfo = new MailInfo(classificationRemove.Provider, classificationRemove.MailAccount, classificationRemove.idMail);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeRelationFilter(classificationRemove.bbdd, classificationRemove.idUser, mailInfo, classificationRemove.idType, classificationRemove.idRelated, null);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveRelation, conn))
                    {
                        AddCommonParameters(classificationRemove.idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        CheckErrorOutParameters(command, result.errors, Codes.Lexon.RemoveClassificationFromList, nameof(RemoveClassificationFromListAsync));
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when remove classification", ex), Codes.Lexon.RemoveClassificationFromList, "MYSQLCONN");
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data == 0)
                    TraceError(result.errors, new LexonDomainException($"Mysql don´t remove of the classification"), Codes.Lexon.RemoveClassificationFromList, "MYSQL");
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
            var result = new MySqlCompany(_settings.Value.SP.SearchRelations, classification.pageIndex, classification.pageSize, classification.bbdd, classification.idType);
            ConfigureByEnv(classification.env, result.Infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetClassificationFromList);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeSearchRelationsFilter(classification.idType, classification.bbdd, classification.idUser, classification.idMail);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchRelations, conn))
                    {
                        AddCommonParameters(classification.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(classification.pageSize, classification.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        result.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = JsonConvert.DeserializeObject<LexMailActuation>(rawResult);
                                    result.AddRelationsMail(resultado);
                                }
                                else
                                {
                                    if (result.Infos.Count > 1)
                                        TraceError(result.Errors, new LexonDomainException($"MySql get an extrange or empty string with this search"), Codes.Lexon.GetClassificationFromList, "MYSQL");
                                    else
                                        TraceInfo(result.Infos, "MySql get and empty string with this search", Codes.Lexon.GetClassificationFromList);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.Errors, new LexonDomainException($"Error when get classifications", ex), Codes.Lexon.GetClassificationFromList, "MYSQLCONN");
            }

            if (_settings.Value.UseMongo)
            {
                if (result.TengoActuaciones())
                    await _usersRepository.UpsertRelationsAsync(classification, result);
                else
                {
                    var resultMongo = await _usersRepository.GetRelationsAsync(classification);
                    result.DataActuation = resultMongo.DataActuation;
                }
            }

            return result;
        }

        public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch)
        {
            var result = new MySqlCompany(_settings.Value.SP.SearchEntities, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);
            ConfigureByEnv(entitySearch.env, result.Infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetEntities);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeSearchEntitiesFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchEntities, conn))
                    {
                        AddCommonParameters(((EntitySearchView)entitySearch).idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(entitySearch.pageSize, entitySearch.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        result.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                    result.AddData(resultado);
                                }
                                else
                                {
                                    if (result.Infos.Count > 1)
                                        TraceError(result.Errors, new LexonDomainException($"MySql get an extrange or empty string with this search"), Codes.Lexon.GetEntities, "MYSQL");
                                    else
                                        TraceInfo(result.Infos, "MySql get and empty string with this search", Codes.Lexon.GetEntities);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.Errors, new LexonDomainException($"Error when get entities", ex), Codes.Lexon.GetEntities, "MYSQLCONN");
            }

            if (_settings.Value.UseMongo)
            {
                if (result.TengoLista())
                    await _usersRepository.UpsertEntitiesAsync(entitySearch, result);
                else
                {
                    var resultMongo = await _usersRepository.GetEntitiesAsync(entitySearch);
                    result.Data = resultMongo.Data;
                }
            }

            return result;
        }

        public async Task<Result<LexEntity>> GetEntityByIdAsync(EntitySearchById entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.GetEntity, 1, 1, entitySearch.bbdd, entitySearch.idType);
            var result = new Result<LexEntity>(new LexEntity());
            ConfigureByEnv(entitySearch.env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetEntity);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeEntityFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetEntity, conn))
                    {
                        AddCommonParameters(entitySearch.idUser, command, "P_FILTER", filtro);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            CheckErrorOutParameters(command, result.errors, Codes.Lexon.GetEntity, nameof(GetEntityByIdAsync));

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
                                            TraceError(resultMySql.Errors, new LexonDomainException($"MySql get an extrange or empty string with this search"), Codes.Lexon.GetEntity, "MYSQL");
                                        else
                                            TraceInfo(resultMySql.Infos, "MySql get and empty string with this search", Codes.Lexon.GetEntity);
                                    }
                                }
                        }
                    }
                    result.data = resultMySql?.Data?.FirstOrDefault();
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when get entitiy by id", ex), Codes.Lexon.GetEntity, "MYSQLCONN");
            }

            return result;
        }

        public async Task<MySqlList<LexEntityTypeList, LexEntityType>> GetEntityTypesAsync(string env)
        {
            var result = new MySqlList<LexEntityTypeList, LexEntityType>(new LexEntityTypeList(), _settings.Value.SP.GetMasterEntities, 1, 0);
            ConfigureByEnv(env, result.Infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetEntityTypes);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = "{}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);

                        AddListSearchParameters(result.PageSize, result.PageIndex, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        result.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (result.PossibleHasData())
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexEntityTypeList>(rawJson));
                                    result.AddData(resultado, resultado.Entities);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.Errors, new LexonDomainException($"Error when get master entities", ex), Codes.Lexon.GetEntityTypes, "MYSQLCONN");
            }

            if (_settings.Value.UseMongo)
            {
                //await GetMasterEntitiesMongoAsync(resultMySql);
            }
            return result;
        }

        public async Task<Result<LexUserSimpleCheck>> CheckRelationsMailAsync(string idUser, string env, MailInfo mail)
        {
            var result = new Result<LexUserSimpleCheck>(new LexUserSimpleCheck());
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.CheckRelationsMail);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeCheckMailFilter(idUser, mail);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.CheckRelations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            CheckErrorOutParameters(command, result.errors, Codes.Lexon.CheckRelationsMail, nameof(CheckRelationsMailAsync));
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
                                        TraceError(result.errors, new LexonDomainException("MySql get and empty string with this search"), Codes.Lexon.CheckRelationsMail, "MYSQL");
                                    }
                                }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when check relations from mail", ex), Codes.Lexon.CheckRelationsMail, "MYSQLCONN");
            }
            return result;
        }

        #endregion Classifications

        #region Contacts

        public async Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch)
        {
            return await _svcContacts.GetContactAsync(entitySearch.env, entitySearch.idUser, entitySearch.bbdd, (short)entitySearch.idType, (long)entitySearch.idEntity);
        }

        public async Task<Result<List<LexContact>>> GetAllContactsAsync(BaseView search)
        {
            var resultadoPaginado = await _svcContacts.GetAllContactsAsync(search.env, search.idUser, search.bbdd, null, 0, 0);
            return new Result<List<LexContact>>() { data = (List<LexContact>)resultadoPaginado.data.Data, errors = resultadoPaginado.errors, infos = resultadoPaginado.infos };
        }

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        {
            var contact = new ContactsView { ContactList = classification.ContactList, mail = classification.mail };

            return await _svcContacts.AddRelationContactsMailAsync(classification.env, classification.idUser, classification.bbdd, contact);
        }

        #endregion Contacts

        #region Folders

        public async Task<MySqlCompany> GetEntitiesFoldersAsync(EntitySearchFoldersView entitySearch)
        {
            //si no se marcar nada o se marca idParent solo se buscan carpetas, si se pide idFolder e idPArent nunca sera carpetas
            if ((entitySearch.idFolder == null && entitySearch.idParent == null)
                || (entitySearch.idParent != null && entitySearch.idFolder == null))
                entitySearch.idType = (short?)LexonAdjunctionType.folders;
            else if (entitySearch.idFolder != null && entitySearch.idParent != null)
                entitySearch.idType = (short?)LexonAdjunctionType.documents;

            var result = await GetEntitiesAsync(entitySearch);

            TraceInfo(result.Infos, $"Se han pedido entidades {entitySearch.idType} a través de {nameof(GetEntitiesFoldersAsync)}", Codes.Lexon.GetFolders);

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
                TraceInfo(result.infos, $"{entityFolder.idFolder} no tiene  folders anidados través de {nameof(GetNestedFolderAsync)}", Codes.Lexon.GetNestedFolders);
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
            var result = new MySqlCompany(_settings.Value.SP.SearchFoldersFiles, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeSearchEntitiesFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchFoldersFiles, conn))
                    {
                        AddCommonParameters(((EntitySearchView)entitySearch).idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(entitySearch.pageSize, entitySearch.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        result.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                    result.AddData(resultado);
                                }
                                else
                                {
                                    if (result.Infos.Count > 1)
                                        TraceError(result.Errors, new LexonDomainException($"MySql get an extrange or empty string with this search"), Codes.Lexon.GetNestedFolders, "MYSQL");
                                    else
                                        TraceInfo(result.Infos, "MySql get and empty string with this search", Codes.Lexon.GetNestedFolders);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.Errors, new LexonDomainException($"Error when get folder and files entities", ex), Codes.Lexon.GetNestedFolders, "MYSQLCONN");
            }

            return result;
        }

        public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity folderToEntity)
        {
            var result = new Result<long>(0);
            ConfigureByEnv(folderToEntity.env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.AddFolderToEntity);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    string filtro = GeFolderCreateFilter(folderToEntity);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddEntityFolder, conn))
                    {
                        AddCommonParameters(folderToEntity.idUser, command, "P_JSON", filtro, true);

                        await command.ExecuteNonQueryAsync();
                        CheckErrorOutParameters(command, result.errors, Codes.Lexon.AddFolderToEntity, nameof(AddFolderToEntityAsync));
                        result.data = GetIntOutputParameter(command.Parameters["P_ID"].Value);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error when add folder to entity", ex), Codes.Lexon.AddFolderToEntity, "MYSQLCONN");
            }

            return result;
        }

        #endregion Folders

        #region Files

        public async Task<Result<string>> FileGetAsync(EntitySearchById fileMail)
        {
            var result = new Result<string>(null);
            ConfigureByEnv(fileMail.env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.GetFile);

            var inicio = DateTime.Now;

            try
            {
                var resultId = await GetIdCompany(fileMail.idUser, fileMail.bbdd, fileMail.env);
                if(resultId.data == 0 || resultId.errors?.Count > 0)
                {
                    AddResultTrace(resultId, result);
                    return result;

                }
                var lexonFile = new LexGetFile
                {
                    idCompany = resultId.data,
                    idUser = fileMail.idUser,
                    idDocument = fileMail.idEntity ?? 0
                };

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);
                var url = $"{_urlLexon}?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}";
                //WriteError($"Se hace llamada a {url} a las {inicio}");

                using (var response = await _clientFiles.GetAsync(url))
                {
                    //WriteError($"Se recibe contestación {DateTime.Now}");

                    if (response.IsSuccessStatusCode)
                    {
                        var arrayFile = await response.Content.ReadAsByteArrayAsync();
                        var stringFile = Convert.ToBase64String(arrayFile);
                        var fileName = response.Content.Headers.ContentDisposition.FileName;
                        result.data = stringFile;
                        TraceInfo(result.infos, $"Se recupera el fichero {fileName} con el id {lexonFile.idDocument}", Codes.Lexon.GetFile);
                    }
                    else
                    {
                        var responseText = await response.Content.ReadAsStringAsync();
                        TraceError(result.errors, new LexonDomainException($"Response not ok : ({responseText}) with external service of lexon code -> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Lexon.GetFile, "LEXONSVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error al obtener el archivo {fileMail.idEntity} -> {ex.Message}", ex), Codes.Lexon.GetFile, "LEXONSVC");
            }

            TraceInfo(result.infos, $"La peticíón se empezó a {inicio} y terminó {DateTime.Now}", Codes.Lexon.GetFile);
            //WriteError($"Salimos de FileGetAsync a las {DateTime.Now}");

            return result;
        }

        public async Task<Result<bool>> FilePostAsync(MailFileView fileMail)
        {
            var result = new Result<bool>(false);
            ConfigureByEnv(fileMail.env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.PostFile);

            var inicio = DateTime.Now;

            try
            {
                var lexonFileResult = await GetFileDataByTypeActuation(fileMail);
                if (lexonFileResult.errors?.Count > 0)
                {
                    AddResultTrace(lexonFileResult, result);
                    return result;
                }

                CleanFileName(lexonFileResult);

                var json = JsonConvert.SerializeObject(lexonFileResult.data);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);
                SerializeObjectToPut(fileMail.ContentFile, $"?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}", out string url, out ByteArrayContent data);

                //WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _clientFiles.PutAsync(url, data))
                {
                    //WriteError($"Se recibe contestación {DateTime.Now}");

                    var responseText = await response.Content.ReadAsStringAsync();
                    if (response.IsSuccessStatusCode)
                    {
                        result.data = true;
                        TraceInfo(result.infos, $"Se guarda el fichero {fileMail.Name} - {responseText}", Codes.Lexon.PostFile);
                    }
                    else
                    {
                        TraceError(result.errors, new LexonDomainException($"Response not ok : ({responseText}) with external service of lexon code -> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Lexon.PostFile, "LEXONSVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new LexonDomainException($"Error al guardar el archivo {fileMail.Name} -> {ex.Message}", ex), Codes.Lexon.PostFile, "LEXONSVC");
            }

            TraceInfo(result.infos, $"La peticíón se empezó a {inicio} y terminó {DateTime.Now}", Codes.Lexon.PostFile);
            // WriteError($"Salimos de FilePostAsync a las {DateTime.Now}");

            return result;
        }

        private void CleanFileName(Result<LexPostFile> lexonFileResult)
        {
            lexonFileResult.data.fileName = RemoveProblematicChars(lexonFileResult.data.fileName);
            var name = Path.GetFileNameWithoutExtension(lexonFileResult.data.fileName);

            name = string.Concat(name.Split(Path.GetInvalidFileNameChars()));
            name = string.Concat(name.Split(Path.GetInvalidPathChars()));
            var maxlenght = name.Length > 55 ? 55 : name.Length;
            lexonFileResult.data.fileName = $"{name.Substring(0, maxlenght)}{Path.GetExtension(lexonFileResult.data.fileName)}";
        }

        private void SerializeObjectToPut(string textInBase64, string path, out string url, out ByteArrayContent byteArrayContent)
        {
            url = $"{_urlLexon}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            byte[] newBytes = Convert.FromBase64String(textInBase64);

            byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
        }

        private async Task<Result<LexPostFile>> GetFileDataByTypeActuation(MailFileView fileMail)
        {
            var result = new Result<LexPostFile>(new LexPostFile());

            try
            {
                var resultId = await GetIdCompany(fileMail.idUser, fileMail.bbdd, fileMail.env);

                if (resultId.data == 0 || resultId.errors?.Count > 0)
                {
                    AddResultTrace(resultId, result);
                    return result;
                }

                var lexonFile = new LexPostFile
                {
                    idCompany = resultId.data,
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

                result.data = lexonFile;
            }
            catch (Exception ex)
            {

                TraceError(result.errors, new LexonDomainException($"Error al componer fichero para envio", ex), Codes.Lexon.PostFile, Codes.Areas.InternalApi);
            }
         
            return result;
        }

        private async Task<Result<long>> GetIdCompany(string idUser, string bbdd, string env)
        {
            var resultId = new Result<long>(0);
            try
            {
                var resultadoCompanies = await GetCompaniesFromUserAsync(idUser, env);
                AddResultTrace(resultadoCompanies, resultId);
                var companies = resultadoCompanies.data.Where(x => x.bbdd.ToLower().Contains(bbdd.ToLower()));
                var idCompany = companies?.FirstOrDefault()?.idCompany;

                resultId.data = idCompany ?? 0;
            }
            catch (Exception ex)
            {
                TraceError(resultId.errors, new LexonDomainException($"Error al obtener id de compañia", ex), Codes.Lexon.GetIdCompany, Codes.Areas.MySql);
            }

            return resultId;
        }

        #endregion Files

        #region Common

        //private string GiveMeBaseFilter(string bbdd, string idUser)
        //{
        //    return $"{{ {GetUserFilter(bbdd, idUser)} }}";
        //}

        private string GiveMeRelationMultipleFilter(string bbdd, string idUser, MailInfo[] listaMails, short? idType, long? idRelated)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetRelationByIdFilter(idType, idRelated) +
                GetMailListFilter("ListaMails", listaMails) +
                $" }}";
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

        #endregion Common
    }
}