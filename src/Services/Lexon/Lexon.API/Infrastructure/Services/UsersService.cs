using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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
        }

        #region Classifications

        public async Task<Result<long>> AddClassificationToListAsync(ClassificationAddView classificationAdd)
        {
            var result = new Result<long>(0);

            SerializeObjectToPost(classificationAdd, "/classifications/add", out string url, out StringContent data);
            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<long>>();

                        if (result.data == 0)
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

        private async Task AddClassificationToListMongoAsync(ClassificationAddView classificationAdd, Result<long> result)
        {
            try
            {
                var resultMongo = await _usersRepository.AddClassificationToListAsync(classificationAdd);

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if (resultMongo.data == 0)
                    TraceOutputMessage(result.errors, "MongoDb don´t create the classification", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
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
            await RemoveClassificationFromListMongoAsync(classificationRemove, result);
            return result;
        }

        private async Task RemoveClassificationFromListMongoAsync(ClassificationRemoveView classificationRemove, Result<long> result)
        {
            try
            {
                var resultMongo = await _usersRepository.RemoveClassificationFromListAsync(classificationRemove);

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if (resultMongo.data == 0)
                    TraceOutputMessage(result.errors, "MongoDb don´t remove the classification", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
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
                resultMySql.Data = resultMongo.Data;
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

        private async Task GetMasterEntitiesMongoAsync(Result<List<LexonEntityType>> result)
        {
            try
            {
                var resultMongo = await _usersRepository.GetClassificationMasterListAsync();

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if (resultMongo.data.Count == 0)
                    TraceOutputMessage(result.errors, "MongoDb don´t recover the master´s entities", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
        }

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

        public async Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder)
        {
            var result = new Result<LexNestedEntity>( new LexNestedEntity());

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
            var resultMySql = new MySqlCompany();
            SerializeObjectToPost(entitySearch, "/entities/search", out string url, out StringContent data);

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

            if (resultMySql.TengoLista())
                await _usersRepository.UpsertEntitiesAsync(entitySearch, resultMySql);
            else
            {
                var resultMongo = await _usersRepository.GetEntitiesAsync(entitySearch);
                resultMySql.Data = resultMongo.Data;
            }

            return resultMySql;
        }

     
        #endregion Entities

        #region User and Companies

        //public async Task<Result<List<LexonUser>>> GetListUsersAsync(int pageSize, int pageIndex, string idUser)
        //{
        //    TraceLog(parameters: new string[] { $"idUser:{idUser}" });

        //    return await _usersRepository.GetListAsync(pageSize, pageIndex, idUser);
        //}

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
                result.data = resultMongo.data;
            }

            return result;
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
                        result.data = resultCompany.data?.companies?.ToList();
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
                result.data = resultMongo.data?.companies?.ToList();
            }

            return result;
        }

        #endregion User and Companies

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.LexonMySqlUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            var json = JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }
    }
}