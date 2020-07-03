using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using System.Data;

namespace Lexon.Infrastructure.Services
{
    public class UsersService : BaseClass<UsersService>, IUsersService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        //private readonly HttpClient _client;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;
        private string _urlLexon;


        public UsersService(
                IOptions<LexonSettings> settings
                , IUsersRepository usersRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<UsersService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            //_client = _clientFactory.CreateClient();
            //_client.BaseAddress = new Uri(_settings.Value.LexonMySqlUrl);
            //_client.DefaultRequestHeaders.Add("Accept", "text/plain");
            GetUrlsByEnvironment(null);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler)
            {
                BaseAddress = new Uri(_settings.Value.LexonFilesUrl)
            };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }


        private void GetUrlsByEnvironment(string environmet)
        {
            if (environmet == null)
                environmet = _settings.Value.DefaultEnvironmet;

            _conn = _settings.Value.LexonUrls.First(x => x.env.Equals(environmet))?.conn;
            _urlLexon = _settings.Value.LexonUrls.First(x => x.env.Equals(environmet))?.url;
        }

        #region Mysql

        #region user

        public async Task<Result<LexUser>> GetUserAsync(string idNavisionUser)
        {
            var result = new Result<LexUser>(new LexUser());
            GetUrlsByEnvironment(null);

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
                    TraceMessage(result.errors, ex);
                }
            }
            if (!string.IsNullOrEmpty(result.data?.name))
            {
                await _usersRepository.UpsertUserAsync(result);
            }
            else
            {
                TraceOutputMessage(result.errors, "Mysql don´t recover the user", 2001);
                var resultMongo = await _usersRepository.GetUserAsync(idNavisionUser);
                AddToFinalResult(result, resultMongo);
            }
            return result;
        }

        public async Task<Result<List<LexCompany>>> GetCompaniesFromUserAsync(string idUser)
        {
            var resultCompany = new Result<LexUser>(new LexUser());
            var result = new Result<List<LexCompany>>(new List<LexCompany>());
            var resultUser = new Result<LexUser>(new LexUser());
            GetUrlsByEnvironment(null);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"IdUser\":\"{idUser}\"}}";
                    await GetUserCommon(resultUser, conn, filtro);
                    AddToFinalResult(result, resultCompany);
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceMessage(result.errors, ex);
                }
            }

            if (!string.IsNullOrEmpty(resultCompany.data?.name))
            {
                await _usersRepository.UpsertCompaniesAsync(resultCompany);
            }
            else
            {
                TraceOutputMessage(result.errors, "Mysql don´t recover the user with companies", 2001);
                var resultMongo = await _usersRepository.GetUserAsync(idUser);
                AddToFinalResult(result, resultMongo);
            }

            return result;
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
                    TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                    if (EvaluateErrorCommand(result.errors, command) == 0)
                        while (reader.Read())
                        {
                            var rawJson = reader.GetValue(0).ToString();
                            result.data = JsonConvert.DeserializeObject<LexUser>(rawJson);
                        }
                }
            }
        }
        #endregion

        #region Classifications

        public async Task<Result<List<int>>> AddClassificationToListAsync(ClassificationAddView classificationAdd)
        {
            var result = new Result<List<int>>(new List<int>());
            GetUrlsByEnvironment(classificationAdd.env);

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
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                            result.data.Add(GetIntOutputParameter(command.Parameters["P_ID"].Value));
                        }
                    }
                }

                if (result.data?.Count == 0)
                    TraceOutputMessage(result.errors, "Mysql don´t create the classification", 2001);
                //else
                //    await AddClassificationToListMongoAsync(classificationAdd, result);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }


        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        {
            var result = new Result<int>(0);
            GetUrlsByEnvironment(classification.env);

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
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }
            //  await AddClassificationToListMongoAsync(idUser, bbdd, listaMails, idRelated, idType, result);
            return result;
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove)
        //public async Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification)
        {
            var result = new Result<long>(0);
            GetUrlsByEnvironment(classificationRemove.env);

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
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (result.data == 0)
                TraceOutputMessage(result.errors, "Mysql don´t remove the classification", 2001);
            //else
            //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);

            return result;
        }

        public async Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classification)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchRelations, classification.pageIndex, classification.pageSize, classification.bbdd, classification.idType);
            GetUrlsByEnvironment(classification.env);

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
                                        TraceOutputMessage(resultMySql.Errors, "2004", "MySql get and empty string with this search");
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

            //if (resultMySql.TengoActuaciones())
            //    await _usersRepository.UpsertRelationsAsync(classificationSearch, resultMySql);
            //else
            //{
            //    //var resultMongo = await _usersRepository.GetRelationsAsync(classificationSearch);
            //    //resultMySql.DataActuation = resultMongo.DataActuation;
            //}

            return resultMySql;
        }

        //public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch)
        //{
        //    return await GetEntitiesCommon(entitySearch, "/entities/search");
        //}

        public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchEntities, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);
            GetUrlsByEnvironment(entitySearch.env);

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
                                        TraceOutputMessage(resultMySql.Errors, "2004", "MySql get and empty string with this search");
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

            //if (resultMySql.TengoLista())
            //    await _usersRepository.UpsertEntitiesAsync(entitySearch, resultMySql);
            //else
            //{
            //    //var resultMongo = await _usersRepository.GetEntitiesAsync(entitySearch);
            //    //resultMySql.Data = resultMongo.Data;
            //}

            return resultMySql;
        }

        public async Task<Result<LexEntity>> GetEntityById(EntitySearchById entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.GetEntity, 1, 1, entitySearch.bbdd, entitySearch.idType);
            var result = new Result<LexEntity>(new LexEntity());
            GetUrlsByEnvironment(entitySearch.env);

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
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
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
                                            TraceOutputMessage(resultMySql.Errors, "2004", "MySql get and empty string with this search");
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

        public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync()
        {
            var resultMySql = new MySqlList<JosEntityTypeList, JosEntityType>(new JosEntityTypeList(), _settings.Value.SP.GetMasterEntities, 1, 0);
            GetUrlsByEnvironment(null);

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

            //await GetMasterEntitiesMongoAsync(result);
            return resultMySql;
        }

        #endregion

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
                                        TraceOutputMessage(resultMySql.Errors, "2004", "MySql get and empty string with this search");
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
            GetUrlsByEnvironment(folderToEntity.env);

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
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
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

        #endregion

        public async Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch)
        {
            var result = new Result<LexContact>(new LexContact());
            GetUrlsByEnvironment(entitySearch.env);

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
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
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
                                        TraceOutputMessage(result.errors, "2004", "MySql get and empty string with this search");
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
                TraceOutputMessage(errors, command.Parameters["P_ERROR"].Value, idError);
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

        private string GiveMeRelationMultipleFilter(string bbdd, string idUser, MailInfo[] listaMails, short? idType, long? idRelated)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetRelationByIdFilter(idType, idRelated) +
                GetMailListFilter("ListaMails", listaMails) +
                $" }}";
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

        #endregion

        #region Classifications

        //public async Task<Result<List<int>>> AddClassificationToListAsync(ClassificationAddView classificationAdd)
        //{
        //    var result = new Result<List<int>>(new List<int>());

        //    SerializeObjectToPost(classificationAdd, "/classifications/add", out string url, out StringContent data);
        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<List<int>>>();

        //                if (result.data?.Count == 0)
        //                    TraceOutputMessage(result.errors, "Mysql don´t create the classification", 2001);
        //                //else
        //                //    await AddClassificationToListMongoAsync(classificationAdd, result);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }

        //    return result;
        //}

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

                //    result.data.Add((int)resultMongo.data);
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al añadir actuaciones para  {classificationAdd.idRelated}: {ex.Message}");
            }
        }

        //public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        //{
        //    var result = new Result<int>(0);

        //    SerializeObjectToPost(classification, "/classifications/contacts/add", out string url, out StringContent data);
        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<int>>();

        //                if (result.data == 0)
        //                    TraceOutputMessage(result.errors, "Mysql don´t create the classification of contacts", 2001);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    //  await AddClassificationToListMongoAsync(idUser, bbdd, listaMails, idRelated, idType, result);
        //    return result;
        //}

        //public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove)
        //{
        //    var result = new Result<long>(0);
        //    SerializeObjectToPost(classificationRemove, "/classifications/delete", out string url, out StringContent data);

        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<long>>();

        //                if (result.data == 0)
        //                    TraceOutputMessage(result.errors, "Mysql don´t remove the classification", 2001);
        //                //else
        //                //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceInfo(result.infos, $"Error al eliminar actuaciones para  {classificationRemove.idRelated}: {ex.Message}");
        //    }

        //    return result;
        //}

        private async Task RemoveClassificationFromListMongoAsync(ClassificationRemoveView classificationRemove, Result<long> result)
        {
            try
            {
                var resultMongo = await _usersRepository.RemoveClassificationFromListAsync(classificationRemove);

                if (resultMongo.infos.Count > 0)
                    result.infos.AddRange(resultMongo.infos);
                else if (resultMongo.data == 0)
                    result.infos.Add(new Info() { code = "error_actuation_mongo", message = "error when remove classification" });
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al eliminar actuaciones para  {classificationRemove.idRelated}: {ex.Message}");
            }
        }

        //public async Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classificationSearch)
        //{
        //    var resultMySql = new MySqlCompany();
        //    SerializeObjectToPost(classificationSearch, "/classifications/search", out string url, out StringContent data);

        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //                resultMySql = await response.Content.ReadAsAsync<MySqlCompany>();
        //            else
        //                TraceOutputMessage(resultMySql.Errors, $"Response not ok with mysql.api with code-> {response.StatusCode} - {response.ReasonPhrase}", 2003);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(resultMySql.Errors, ex);
        //    }

        //    //if (resultMySql.TengoActuaciones())
        //    //    await _usersRepository.UpsertRelationsAsync(classificationSearch, resultMySql);
        //    //else
        //    //{
        //    //    //var resultMongo = await _usersRepository.GetRelationsAsync(classificationSearch);
        //    //    //resultMySql.DataActuation = resultMongo.DataActuation;
        //    //}

        //    return resultMySql;
        //}

        #endregion Classifications


        #region Entities

        //public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync()
        //{
        //    var resultMySql = new MySqlList<JosEntityTypeList, JosEntityType>();
        //    var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/entities/masters");
        //    TraceLog(parameters: new string[] { $"request:{request}" });

        //    try
        //    {
        //        using (var response = await _client.SendAsync(request))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                resultMySql = await response.Content.ReadAsAsync<MySqlList<JosEntityTypeList, JosEntityType>>();
        //                resultMySql.result = null;
        //                if (!resultMySql.TengoLista())
        //                    TraceOutputMessage(resultMySql.Errors, "Mysql don´t recover the master´s entities", 2001);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(resultMySql.Errors, $"Response not ok with mysql.api with code->{response.StatusCode} - {response.ReasonPhrase}", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(resultMySql.Errors, ex);
        //    }
        //    //await GetMasterEntitiesMongoAsync(result);
        //    return resultMySql;
        //}

        //private async Task GetMasterEntitiesMongoAsync(Result<List<LexonEntityType>> result)
        //{
        //    try
        //    {
        //        var resultMongo = await _usersRepository.GetClassificationMasterListAsync();

        //        if (resultMongo.errors.Count > 0)
        //            result.errors.AddRange(resultMongo.errors);
        //        else if (resultMongo.data.Count == 0)
        //            TraceOutputMessage(result.errors, "MongoDb don´t recover the master´s entities", 2002);
        //        else
        //            result.data = resultMongo.data;
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //}

        //public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder)
        //{
        //    var result = new Result<long>(0);

        //    SerializeObjectToPost(entityFolder, "/entities/folders/add", out string url, out StringContent data);
        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<long>>();

        //                if (result.data == 0)
        //                    TraceOutputMessage(result.errors, "Mysql don´t create the folder", 2001);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }

        //    return result;
        //}

        public async Task<Result<string>> FileGetAsync(EntitySearchById fileMail)
        {
            var result = new Result<string>(null);
            try
            {
                var lexonFile = new LexonGetFile
                {
                    idCompany = await GetIdCompany(fileMail.idUser, fileMail.bbdd),
                    idUser = fileMail.idUser,
                    idDocument = fileMail.idEntity ?? 0
                };

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);
                var url = $"{_settings.Value.LexonFilesUrl}?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}";
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
                        TraceOutputMessage(result.errors, $"Response not ok : {responseText} with lexon-dev with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.idEntity}, -> {ex.Message} - {ex.InnerException?.Message}", "599");
            }

            WriteError($"Salimos de FileGetAsync a las {DateTime.Now}");
            return result;
        }

        public async Task<Result<bool>> FilePostAsync(MailFileView fileMail)
        {
            var result = new Result<bool>(false);
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
                        TraceOutputMessage(result.errors, $"Response not ok : {responseText} with lexon-dev with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                //TraceMessage(result.errors, ex);
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.Name}, -> {ex.Message} - {ex.InnerException?.Message}", "598");
            }
            WriteError($"Salimos de FilePostAsync a las {DateTime.Now}");

            return result;
        }

        private async Task<LexonPostFile> GetFileDataByTypeActuation(MailFileView fileMail)
        {
            var lexonFile = new LexonPostFile
            {
                idCompany = await GetIdCompany(fileMail.idUser, fileMail.bbdd),
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

        private async Task<long> GetIdCompany(string idUser, string bbdd)
        {
            var resultadoCompanies = await GetCompaniesFromUserAsync(idUser);
            var companies = resultadoCompanies.data.Where(x => x.bbdd.ToLower().Contains(bbdd.ToLower()));
            var idCompany = companies?.FirstOrDefault()?.idCompany;
            return idCompany ?? 0; // "88";
        }

        //public async Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder)
        //{
        //    var result = new Result<LexNestedEntity>(new LexNestedEntity());

        //    SerializeObjectToPost(entityFolder, "/entities/folders/nested", out string url, out StringContent data);
        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<LexNestedEntity>>();

        //                if (result.data == null)
        //                    TraceOutputMessage(result.errors, "Mysql don´t get the nested folders", 2001);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }

        //    return result;
        //}

        //public async Task<Result<LexEntity>> GetEntityById(EntitySearchById entitySearch)
        //{
        //    var result = new Result<LexEntity>(new LexEntity());
        //    SerializeObjectToPost(entitySearch, "/entities/getbyid", out string url, out StringContent data);

        //    try
        //    {
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<LexEntity>>();
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }

        //    return result;
        //}

        //public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch)
        //{
        //    return await GetEntitiesCommon(entitySearch, "/entities/search");
        //}

        //private async Task<MySqlCompany> GetEntitiesCommon(EntitySearchView entitySearch, string path)
        //{
        //    var resultMySql = new MySqlCompany();

        //    try
        //    {
        //        SerializeObjectToPost(entitySearch, path, out string url, out StringContent data);
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //                resultMySql = await response.Content.ReadAsAsync<MySqlCompany>();
        //            else
        //                TraceOutputMessage(resultMySql.Errors, $"Response not ok with mysql.api with code-> {response.StatusCode} - {response.ReasonPhrase}", 2003);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(resultMySql.Errors, ex);
        //    }

        //    //if (resultMySql.TengoLista())
        //    //    await _usersRepository.UpsertEntitiesAsync(entitySearch, resultMySql);
        //    //else
        //    //{
        //    //    //var resultMongo = await _usersRepository.GetEntitiesAsync(entitySearch);
        //    //    //resultMySql.Data = resultMongo.Data;
        //    //}

        //    return resultMySql;
        //}

        //public async Task<MySqlCompany> GetEntitiesFoldersAsync(EntitySearchFoldersView entitySearch)
        //{
        //    //si no se marcar nada o se marca idParent solo se buscan carpetas, si se pide idFolder e idPArent nunca sera carpetas
        //    if ((entitySearch.idFolder == null && entitySearch.idParent == null) 
        //        || (entitySearch.idParent != null && entitySearch.idFolder == null))
        //        entitySearch.idType = (short?)LexonAdjunctionType.folders;
        //    else if(entitySearch.idFolder != null && entitySearch.idParent != null)
        //        entitySearch.idType = (short?)LexonAdjunctionType.documents;

        //    var result = await GetEntitiesCommon(entitySearch, "/entities/folders/search");

        //    if(entitySearch.idType == (short?)LexonAdjunctionType.files || entitySearch.idType == (short?)LexonAdjunctionType.folders)
        //    {
        //        result.Data = result.Data?.FindAll(entity => entity.idType == entitySearch.idType);
        //        result.Count = result.Data?.Count();
        //    };
        //    return result;
        //}

        #endregion Entities

        #region User and Companies

        //public async Task<Result<LexUser>> GetUserAsync(string idNavisionUser)
        //{
        //    var result = new Result<LexUser>(new LexUser());

        //    var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/user?idNavisionUser={idNavisionUser}");
        //    TraceLog(parameters: new string[] { $"request:{request}" });

        //    try
        //    {
        //        using (var response = await _client.SendAsync(request))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                result = await response.Content.ReadAsAsync<Result<LexUser>>();
        //                result.data.idNavision = idNavisionUser;
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }

        //    if (!string.IsNullOrEmpty(result.data?.name))
        //    {
        //        await _usersRepository.UpsertUserAsync(result);
        //    }
        //    else
        //    {
        //        TraceOutputMessage(result.errors, "Mysql don´t recover the user", 2001);
        //        var resultMongo = await _usersRepository.GetUserAsync(idNavisionUser);
        //        AddToFinalResult(result, resultMongo);
        //    }

        //    return result;
        //}

        private static void AddToFinalResult(Result<LexUser> result, Result<LexUser> resultPreview)
        {
            result.errors.AddRange(resultPreview.errors);
            result.infos.AddRange(resultPreview.infos);
            result.data = resultPreview.data;
        }

        //public async Task<Result<List<LexCompany>>> GetCompaniesFromUserAsync(string idUser)
        //{
        //    var resultCompany = new Result<LexUser>(new LexUser());
        //    var result = new Result<List<LexCompany>>(new List<LexCompany>());
        //    var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/companies?idUser={idUser}");
        //    TraceLog(parameters: new string[] { $"request:{request}" });

        //    try
        //    {
        //        using (var response = await _client.SendAsync(request))
        //        {
        //            if (response.IsSuccessStatusCode)
        //            {
        //                resultCompany = await response.Content.ReadAsAsync<Result<LexUser>>();
        //                AddToFinalResult(result, resultCompany);
        //            }
        //            else
        //            {
        //                TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }

        //    if (!string.IsNullOrEmpty(resultCompany.data?.name))
        //    {
        //        await _usersRepository.UpsertCompaniesAsync(resultCompany);
        //    }
        //    else
        //    {
        //        TraceOutputMessage(result.errors, "Mysql don´t recover the user with companies", 2001);
        //        var resultMongo = await _usersRepository.GetUserAsync(idUser);
        //        AddToFinalResult(result, resultMongo);
        //    }

        //    return result;
        //}

        private static void AddToFinalResult(Result<List<LexCompany>> result, Result<LexUser> resultPreliminar)
        {
            result.errors.AddRange(resultPreliminar.errors);
            result.infos.AddRange(resultPreliminar.infos);
            result.data = resultPreliminar.data?.companies?.ToList();
        }

        #endregion User and Companies

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.LexonMySqlUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            var json = JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }

        private void SerializeObjectToPut(string textInBase64, string path, out string url, out ByteArrayContent byteArrayContent)
        {
            url = $"{_settings.Value.LexonFilesUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            byte[] newBytes = Convert.FromBase64String(textInBase64);

            byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
        }

        //public async Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch)
        //{
        //    var resultContact = new Result<LexContact>(new LexContact());

        //    try
        //    {
        //        var path = $"/entities/contact/getbyid";
        //        SerializeObjectToPost(entitySearch, path, out string url, out StringContent data);
        //        using (var response = await _client.PostAsync(url, data))
        //        {
        //            if (response.IsSuccessStatusCode)
        //                resultContact = await response.Content.ReadAsAsync<Result<LexContact>>();
        //            else
        //                TraceOutputMessage(resultContact.errors, $"Response not ok with mysql.api with code-> {response.StatusCode} - {response.ReasonPhrase}", 2003);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(resultContact.errors, ex);
        //    }
        //    return resultContact;
        //}
    }
}