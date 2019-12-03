using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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

        public async Task<Result<long>> AddClassificationToListAsync(string idUser, long idCompany, string bbdd, string[] listaMails, long idRelated, short idClassificationType = 1)
        {
            long a = 0;
            var result = new Result<long>(a);

            //GetInfoUser(idUser, idCompany, out string bbdd, out int codeUser);
            var url = $"{_settings.Value.LexonMySqlUrl}/classifications/add";

            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idType:{idClassificationType}", $"bbdd:{bbdd}", $"idMail:{listaMails}", $"idRelated:{idRelated}" });
            TraceLog(parameters: new string[] { $"url={url}" });

            var classificationAdd = new ClassificationAddView
            {
                idType = idClassificationType,
                bbdd = bbdd,
                idRelated = idRelated,
                idUser = idUser,
                listaMails = listaMails
            };

            var json = JsonConvert.SerializeObject(classificationAdd);
            var data = new StringContent(json, Encoding.UTF8, "application/json");
            try
            {
                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<long>>();

                        if (result.data == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t create the classification", 2001);
                        //else
                        //    return result;
                        //todo: deberia gestionarse el error y tomar decision se seguir o no, mandar un evento...
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
            await AddClassificationToListMongoAsync(idUser, idCompany, listaMails, idRelated, idClassificationType, result);
            return result;
        }

        private async Task AddClassificationToListMongoAsync(string idUser, long idCompany, string[] listaMails, long idRelated, short idClassificationType, Result<long> result)
        {
            try
            {
                var resultMongo = await _usersRepository.AddClassificationToListAsync(idUser, idCompany, listaMails, idRelated, idClassificationType);

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

        public async Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail)
        {

            var result = new Result<List<LexonActuation>>(new List<LexonActuation>());

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/classifications/search?pageSize={pageSize}&pageIndex={pageIndex}&idType={1}&bbdd={bbdd}&idUser={idUser}&idMail={idMail}");
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"bbdd:{bbdd}", $"idMail:{idMail}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var resultMysql = await response.Content.ReadAsAsync<Result<JosRelationsList>>();
                        foreach (var entity in resultMysql.data.Actuaciones)
                        {
                           
                            result.data.Add(new LexonActuation() { name = entity.Nombre, description = entity.Asunto, entityType = "Mail", idMail= idMail, idRelated= entity.IdRelacion });
                            TraceLog(parameters: new string[] { $"add Name {entity.Nombre}", $"desc {entity.Asunto}", $"tipo Mail", $"idrelated {entity.IdRelacion}", $"idmail {idMail}" });
                        }

                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the mails actuations", 2001);
                        else
                            return result;
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
            await GetClassificationsFromMailMongoAsync(result, pageSize, pageIndex, idUser, 14, idMail);
            return result;

        }

        private async Task GetClassificationsFromMailMongoAsync(Result<List<LexonActuation>> result, int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            try
            {
                var resultMongo = await _usersRepository.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if (resultMongo.data.Count == 0)
                    TraceOutputMessage(result.errors, "MongoDb don´t recover relations of mails", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
        }

        public async Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync()
        {
            var result = new Result<List<LexonEntityType>>(new List<LexonEntityType>());

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/entities/masters");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        foreach (var entity in (await response.Content.ReadAsAsync<Result<JosEntityTypeList>>()).data.Entities)
                        {
                            result.data.Add(new LexonEntityType() { name = entity.Name, idEntity = entity.IdEntity });
                            TraceLog(parameters: new string[] { $"add {entity.Name}" });
                        }

                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the master´s entities", 2001);
                        else
                            return result;
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
            await GetClassificationsMasterMongosync(result);
            return result;
        }

        private async Task GetClassificationsMasterMongosync(Result<List<LexonEntityType>> result)
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

        public async Task<Result<List<LexonCompany>>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            var result = new Result<List<LexonCompany>>(new List<LexonCompany>());
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/companies?pageSize={pageSize}&pageIndex={pageIndex}&idUser={idUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        foreach (var company in (await response.Content.ReadAsAsync<Result<JosUserCompanies>>()).data.Companies)
                        {
                            result.data.Add(new LexonCompany() { name = company.Name, bbdd = company.BBDD, idCompany = company.IdCompany });
                            TraceLog(parameters: new string[] { $"add {company.Name}" });
                        }

                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the companies", 2001);
                        else
                            return result;
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
            await GetCompaniesFromUserMongoAsync(idUser, result);
            return result;
        }

        private async Task GetCompaniesFromUserMongoAsync(string idUser, Result<List<LexonCompany>> result)
        {
            try
            {
                var resultMongo = await _usersRepository.GetCompaniesListAsync(idUser);

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if (resultMongo.data.Count == 0)
                    TraceOutputMessage(result.errors, "MongoDb don´t recover the companies", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
        }

        public async Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, short idType, string idUser, long idCompany, string bbdd, string search, long idFilter)
        {
            var result = new Result<List<LexonEntityBase>>(new List<LexonEntityBase>());

            var request = new HttpRequestMessage(HttpMethod.Get,
                $"{_settings.Value.LexonMySqlUrl}/entities/search?pageSize={pageSize}&pageIndex={pageIndex}&idType={idType}&bbdd={bbdd}&search={search}&idUser={idUser}&idFilter={idFilter}");

            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany={idCompany}", $"bbdd:{bbdd}", $"idType:{idType}", $"search={search}", $"idFilter={idFilter}" });
            TraceLog(parameters: new string[] { $"request={request}" });

            try
            {
                var entities = new List<LexonEntityBase>();

                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var entityList = await response.Content.ReadAsAsync<Result<JosEntityList>>();
                        foreach (var entity in (entityList.data.Entities))
                        {
                            result.data.Add(new LexonEntityBase() { name = entity.Code, description = entity.Description, id = entity.IdRelated });
                            TraceLog(parameters: new string[] { $"code {entity.Code}" });
                        }

                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the entities", 2001);
                        else
                            return result;
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
            await GetEntitiesListMongoAsync(pageSize, pageIndex, idType, idUser, idCompany, search, result);
            return result;
        }

        private async Task GetEntitiesListMongoAsync(int pageSize, int pageIndex, short idType, string idUser, long idCompany, string search, Result<List<LexonEntityBase>> result)
        {
            try
            {
                //todo idFilter tiene que implementarse en mongo
                var resultMongo = await _usersRepository.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search);

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if (resultMongo.data.Count == 0)
                    TraceOutputMessage(result.errors, "MongoDb don´t recover the entities", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
        }

        public async Task<Result<List<LexonUser>>> GetListUsersAsync(int pageSize, int pageIndex, string idUser)
        {
            TraceLog(parameters: new string[] { $"idUser:{idUser}" });

            return await _usersRepository.GetListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<Result<LexonUser>> GetUserAsync(string idUser)
        {
            var result = new Result<LexonUser>(new LexonUser ());

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/user?idNavisionUser={idUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var resultMysql = await response.Content.ReadAsAsync<Result<JosUser>>();
                        result.errors = resultMysql.errors;

                        if (string.IsNullOrEmpty(resultMysql.data.Name))
                            TraceOutputMessage(result.errors, "Mysql don´t recover the user", 2001);
                        else
                        {
                            result.data = new LexonUser() { Name = resultMysql.data.Name, idUser = resultMysql.data.IdUser.ToString(), idNavision  = idUser };
                            TraceLog(parameters: new string[] { $"iduser {result.data.idUser}" });
                            return result;
                        }
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
            await GetUserForMongoAsync(idUser, result);
            return result;

        }

        private async Task GetUserForMongoAsync(string idUser, Result<LexonUser> result)
        {
            try
            {
                var resultMongo = await _usersRepository.GetAsync(idUser);

                if (resultMongo.errors.Count > 0)
                    result.errors.AddRange(resultMongo.errors);
                else if ((string.IsNullOrEmpty(resultMongo.data.Name)))
                    TraceOutputMessage(result.errors, "MongoDb don´t recover the user", 2002);
                else
                    result.data = resultMongo.data;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(string idUser, long idCompany, string bbdd, string idMail, long idRelated, short idClassificationType = 1)
        {
            long a = 0;
            var result = new Result<long>(a);

            var url = $"{_settings.Value.LexonMySqlUrl}/classifications/delete";

            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idType:{idClassificationType}", $"bbdd:{bbdd}", $"idUser:{idUser}", $"idMail:{idMail}", $"idRelated:{idRelated}" });
            TraceLog(parameters: new string[] { $"url={url}" });

            try
            {
                var classificationRemove = new ClassificationRemoveView
                {
                    idType = idClassificationType,
                    bbdd = bbdd,
                    idRelated = idRelated,
                    idUser = idUser,
                    idMail = idMail
                };

                var json = JsonConvert.SerializeObject(classificationRemove);
                var data = new StringContent(json, Encoding.UTF8, "application/json");

                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<long>>();

                        if (result.data == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t remove the classification", 2001);
                        //else
                        //    return result;
                        //todo: deberia gestionarse el error y tomar decision se seguir o no, mandar un evento...
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
            await RemoveClassificationFromListMongoAsync(idUser, idCompany, idMail, idRelated, idClassificationType, result);
            return result;
        }

        private async Task RemoveClassificationFromListMongoAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType, Result<long> result)
        {
            try
            {
                var resultMongo = await _usersRepository.RemoveClassificationFromListAsync(idUser, idCompany, idMail, idRelated, idClassificationType);

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

        public async Task<Result<long>> SelectCompanyAsync(string idUser, long idCompany)
        {
            TraceLog(parameters: new string[] { $"idUser={idUser}", $"idCompany={idCompany}" });
            return await _usersRepository.SelectCompanyAsync(idUser, idCompany);
        }

        public async Task<Result<long>> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "")
        {
            TraceLog(parameters: new string[] { $"idUser={idUser}", $"idCompany={idCompany}", $"idCompany={idFile}", $"idCompany={nameFile}", $"idCompany={descriptionFile}" });

            return await _usersRepository.AddFileToListAsync(idUser, idCompany, idFile, nameFile, descriptionFile);
        }
    }
}