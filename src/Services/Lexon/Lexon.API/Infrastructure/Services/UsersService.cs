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

namespace Lexon.Infrastructure.Services
{
    public class UsersService : BaseClass<UsersService>, IUsersService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _client;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;

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

            _client = _clientFactory.CreateClient();
            _client.BaseAddress = new Uri(_settings.Value.LexonMySqlUrl);
            _client.DefaultRequestHeaders.Add("Accept", "text/plain");

            _clientFiles = _clientFactory.CreateClient();
            _clientFiles.BaseAddress = new Uri(_settings.Value.LexonFilesUrl);
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        #region Classifications

        public async Task<Result<List<int>>> AddClassificationToListAsync(ClassificationAddView classificationAdd)
        {
            var result = new Result<List<int>>(new List<int>());

            SerializeObjectToPost(classificationAdd, "/classifications/add", out string url, out StringContent data);
            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<List<int>>>();

                        if (result.data?.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t create the classification", 2001);
                        else
                            await AddClassificationToListMongoAsync(classificationAdd, result);
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
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

                //    result.data.Add((int)resultMongo.data);
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al añadir actuaciones para  {classificationAdd.idRelated}: {ex.Message}");
            }
        }

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        {
            var result = new Result<int>(0);

            SerializeObjectToPost(classification, "/classifications/contacts/add", out string url, out StringContent data);
            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<int>>();

                        if (result.data == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t create the classification of contacts", 2001);
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            //  await AddClassificationToListMongoAsync(idUser, bbdd, listaMails, idRelated, idType, result);
            return result;
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove)
        {
            var result = new Result<long>(0);
            SerializeObjectToPost(classificationRemove, "/classifications/delete", out string url, out StringContent data);

            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<long>>();

                        if (result.data == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t remove the classification", 2001);
                        else
                            await RemoveClassificationFromListMongoAsync(classificationRemove, result);
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al eliminar actuaciones para  {classificationRemove.idRelated}: {ex.Message}");
            }

            return result;
        }

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

        public async Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classificationSearch)
        {
            var resultMySql = new MySqlCompany();
            SerializeObjectToPost(classificationSearch, "/classifications/search", out string url, out StringContent data);

            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                        resultMySql = await response.Content.ReadAsAsync<MySqlCompany>();
                    else
                        TraceOutputMessage(resultMySql.Errors, $"Response not ok with mysql.api with code-> {response.StatusCode} - {response.ReasonPhrase}", 2003);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(resultMySql.Errors, ex);
            }

            if (resultMySql.TengoActuaciones())
                await _usersRepository.UpsertRelationsAsync(classificationSearch, resultMySql);
            else
            {
                var resultMongo = await _usersRepository.GetRelationsAsync(classificationSearch);
                resultMySql.DataActuation = resultMongo.DataActuation;
            }

            return resultMySql;
        }

        #endregion Classifications

        #region Entities

        public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync()
        {
            var resultMySql = new MySqlList<JosEntityTypeList, JosEntityType>();
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/entities/masters");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        resultMySql = await response.Content.ReadAsAsync<MySqlList<JosEntityTypeList, JosEntityType>>();
                        resultMySql.result = null;
                        if (!resultMySql.TengoLista())
                            TraceOutputMessage(resultMySql.Errors, "Mysql don´t recover the master´s entities", 2001);
                    }
                    else
                    {
                        TraceOutputMessage(resultMySql.Errors, $"Response not ok with mysql.api with code->{response.StatusCode} - {response.ReasonPhrase}", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(resultMySql.Errors, ex);
            }
            //await GetMasterEntitiesMongoAsync(result);
            return resultMySql;
        }

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

        public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder)
        {
            var result = new Result<long>(0);

            SerializeObjectToPost(entityFolder, "/entities/folders/add", out string url, out StringContent data);
            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<long>>();

                        if (result.data == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t create the folder", 2001);
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<bool>> FilePostAsync(MailFileView fileMail)
        {
            var result = new Result<bool>(false);
            try
            {
                LexonFile lexonFile = new LexonFile
                {
                    fileName = fileMail.Name,
                    idAction = fileMail.IdActuation ?? 0,
                    idCompany = await GetIdCompany(fileMail.idUser,fileMail.bbdd),
                    idUser = fileMail.idUser,
                    idFolder = fileMail.IdParent ?? 0,
                    idEntity = fileMail.idEntity ?? 0,
                    idTypeEntity = fileMail.idType ?? 0
                };

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.Unicode.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);

                SerializeObjectToPut(fileMail.ContentFile, $"?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}", out string url, out ByteArrayContent data);

                using (var response = await _clientFiles.PutAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result.data = true;
                        TraceInfo(result.infos, $"Se guarda el fichero {fileMail.Name}");
                    }
                    else
                        TraceOutputMessage(result.errors, $"Response not ok with lexon-dev with code-> {response.StatusCode} - {response.ReasonPhrase}", 2003);
                }
            }
            catch (Exception ex)
            {
                //TraceMessage(result.errors, ex);
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.Name}, -> {ex.Message}", "590");

            }

            return result;
        }

        private async Task<long> GetIdCompany(string idUser, string bbdd)
        {
            var resultadoCompanies = await GetCompaniesFromUserAsync(idUser);
            var companies = resultadoCompanies.data.Where(x => x.bbdd.ToLower().Contains(bbdd.ToLower()));
            var idCompany = companies?.FirstOrDefault()?.idCompany;
            return idCompany ?? 0; // "88";
        }

        public async Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder)
        {
            var result = new Result<LexNestedEntity>(new LexNestedEntity());

            SerializeObjectToPost(entityFolder, "/entities/folders/nested", out string url, out StringContent data);
            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<LexNestedEntity>>();

                        if (result.data == null)
                            TraceOutputMessage(result.errors, "Mysql don´t get the nested folders", 2001);
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<LexEntity>> GetEntityById(EntitySearchById entitySearch)
        {
            var result = new Result<LexEntity>(new LexEntity());
            SerializeObjectToPost(entitySearch, "/entities/getbyid", out string url, out StringContent data);

            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<LexEntity>>();
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch)
        {
            return await GetEntitiesCommon(entitySearch, "/entities/search");
        }

        private async Task<MySqlCompany> GetEntitiesCommon(EntitySearchView entitySearch, string path)
        {
            var resultMySql = new MySqlCompany();

            try
            {
                SerializeObjectToPost(entitySearch, path, out string url, out StringContent data);
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                        resultMySql = await response.Content.ReadAsAsync<MySqlCompany>();
                    else
                        TraceOutputMessage(resultMySql.Errors, $"Response not ok with mysql.api with code-> {response.StatusCode} - {response.ReasonPhrase}", 2003);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(resultMySql.Errors, ex);
            }

            if (resultMySql.TengoLista())
                await _usersRepository.UpsertEntitiesAsync(entitySearch, resultMySql);
            else
            {
                var resultMongo = await _usersRepository.GetEntitiesAsync(entitySearch);
                resultMySql.Data = resultMongo.Data;
            }

            return resultMySql;
        }

        public async Task<MySqlCompany> GetEntitiesFoldersAsync(EntitySearchFoldersView entitySearch)
        {
            return await GetEntitiesCommon(entitySearch, "/entities/folders/search");
        }

        public async Task<MySqlCompany> GetEntitiesDocumentsAsync(EntitySearchDocumentsView entitySearch)
        {
            return await GetEntitiesCommon(entitySearch, "/entities/documents/search");
        }

        #endregion Entities

        #region User and Companies

        public async Task<Result<LexUser>> GetUserAsync(string idNavisionUser)
        {
            var result = new Result<LexUser>(new LexUser());

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/user?idNavisionUser={idNavisionUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<LexUser>>();
                        result.data.idNavision = idNavisionUser;
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
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

        private static void AddToFinalResult(Result<LexUser> result, Result<LexUser> resultPreview)
        {
            result.errors.AddRange(resultPreview.errors);
            result.infos.AddRange(resultPreview.infos);
            result.data = resultPreview.data;
        }

        public async Task<Result<List<LexCompany>>> GetCompaniesFromUserAsync(string idUser)
        {
            var resultCompany = new Result<LexUser>(new LexUser());
            var result = new Result<List<LexCompany>>(new List<LexCompany>());
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/companies?idUser={idUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        resultCompany = await response.Content.ReadAsAsync<Result<LexUser>>();
                        AddToFinalResult(result, resultCompany);
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
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

        private static void AddToFinalResult(Result<List<LexCompany>> result, Result<LexUser> resultPreliminar)
        {
            result.errors.AddRange(resultPreliminar.errors);
            result.infos.AddRange(resultPreliminar.infos);
            result.data = resultPreliminar.data?.companies?.ToList();
        }

        #endregion User and Companies

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.LexonFilesUrl}{path}";
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
    }
}