﻿using Lexon.API;
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

        public async Task<Result<long>> AddClassificationToListAsync(string idUser, long idCompany, string[] listaMails, long idRelated, short idClassificationType = 1)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };

            GetInfoUser(idUser, idCompany, out string bbdd, out int codeUser);
            var url = $"{_settings.Value.LexonMySqlUrl}/classifications/add";

            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idType:{idClassificationType}", $"bbdd:{bbdd}", $"idUser:{idUser}", $"idMail:{listaMails}", $"idRelated:{idRelated}" });
            TraceLog(parameters: new string[] { $"url={url}" });

            try
            {
                //curl -X POST "https://localhost:44393/api/v1/LexonMySql/classifications/add" -H  "accept: text/plain" -H  "Content-Type: application/json-patch+json"
                //-d "{  \"listaMails\": [    \"uff\",\"ddd\"  ],  \"idType\": 1,  \"bbdd\": \"lexon_admin_02\",  \"idUser\": \"449\",  \"idRelated\": 111}"

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

                using (var response = await _client.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<long>>();
                        
                        if (result.data == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t create the classification", 2001);

                        var resultMongo = await _usersRepository.AddClassificationToListAsync(idUser, idCompany, listaMails, idRelated, idClassificationType);

                        if (resultMongo.errors.Count > 0)
                            result.errors.AddRange(resultMongo.errors);
                        else if (resultMongo.data == 0)
                            TraceOutputMessage(result.errors, "MongoDb don´t create the classification", 2002);
                        else
                            result.data = resultMongo.data;
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

        public async Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany:{idCompany}", $"idMail:{idMail}" });
            //todo: implementar procedure of mysql
            return await _usersRepository.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
        }

        public async Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync()
        {
            var result = new Result<List<LexonEntityType>> { errors = new List<ErrorInfo>() };

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/entities/masters");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        foreach (var entity in (await response.Content.ReadAsAsync<JosEntityTypeList>()).Entities)
                        {
                            result.data.Add(new LexonEntityType() { name = entity.name, idEntity = entity.idEntity });
                            TraceLog(parameters: new string[] { $"add {entity.name}" });
                        }

                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the master´s entities", 2001);
                        else
                            return result;

                        var resultMongo = await _usersRepository.GetClassificationMasterListAsync();

                        if (resultMongo.errors.Count > 0)
                            result.errors.AddRange(resultMongo.errors);
                        else if (resultMongo.data.Count == 0)
                            TraceOutputMessage(result.errors, "MongoDb don´t recover the master´s entities", 2002);
                        else
                            result.data = resultMongo.data;
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

        public async Task<Result<List<LexonCompany>>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            var result = new Result<List<LexonCompany>> { errors = new List<ErrorInfo>() };
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/companies?pageSize={pageSize}&pageIndex={pageIndex}&idUser={idUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        foreach (var company in (await response.Content.ReadAsAsync<JosUserCompanies>()).Companies)
                        {
                            result.data.Add(new LexonCompany() { name = company.name, bbdd = company.BBDD, idCompany = company.IdCompany });
                            TraceLog(parameters: new string[] { $"add {company.name}" });
                        }

                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the companies", 2001);
                        else
                            return result;

                        var resultMongo = await _usersRepository.GetCompaniesListAsync(idUser);

                        if (resultMongo.errors.Count > 0)
                            result.errors.AddRange(resultMongo.errors);
                        else if (resultMongo.data.Count == 0)
                            TraceOutputMessage(result.errors, "MongoDb don´t recover the companies", 2002);
                        else
                            result.data = resultMongo.data;
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

        public async Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, short idType, string idUser, long idCompany, string search, long idFilter)
        {
            var result = new Result<List<LexonEntityBase>> { errors = new List<ErrorInfo>() };

            GetInfoUser(idUser, idCompany, out string bbdd, out int codeUser);
            var request = new HttpRequestMessage(HttpMethod.Get,
                $"{_settings.Value.LexonMySqlUrl}/entities/search?pageSize={pageSize}&pageIndex={pageIndex}&idType={idType}&bbdd={bbdd}&idUser={codeUser}&idFilter={idFilter}");

            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany={idCompany}", $"bbdd:{bbdd}", $"idType:{idType}", $"search={search}", , $"idFilter={idFilter}" });
            TraceLog(parameters: new string[] { $"request={request}" });

            try
            {
                var entities = new List<LexonEntityBase>();

                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var entityList = await response.Content.ReadAsAsync<JosEntityList>();
                        foreach (var entity in (entityList.Entities))
                        {
                            result.data.Add(new LexonEntityBase() { name = entity.code, description = entity.Description, id = entity.idRelated });
                            TraceLog(parameters: new string[] { $"code {entity.code}" });
                        }
                        if (result.data.Count == 0)
                            TraceOutputMessage(result.errors, "Mysql don´t recover the entities", 2001);
                        else
                            return result;
                        //todo idFilter tiene que implementarse en mongo
                        var resultMongo = await _usersRepository.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search);

                        if (resultMongo.errors.Count > 0)
                            result.errors.AddRange(resultMongo.errors);
                        else if (resultMongo.data.Count == 0)
                            TraceOutputMessage(result.errors, "MongoDb don´t recover the entities", 2002);
                        else
                            result.data = resultMongo.data;
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

        private void GetInfoUser(string idUser, long idCompany, out string bbdd, out int codeUser)
        {

            //todo get bbdd and code from user
            bbdd = "lexon_admin_02";
            codeUser = 520;
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany={idCompany}", $"bbdd:{bbdd}", $"codeUser:{codeUser}" });
        }

        public async Task<Result<List<LexonUser>>> GetListUsersAsync(int pageSize, int pageIndex, string idUser)
        {
            TraceLog(parameters: new string[] { $"idUser:{idUser}" });

            return await _usersRepository.GetListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<Result<LexonUser>> GetUserAsync(string idUser)
        {
            TraceLog(parameters: new string[] { $"idUser:{idUser}" });
            return await _usersRepository.GetAsync(idUser);
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };

            GetInfoUser(idUser, idCompany, out string bbdd, out int codeUser);
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

                        var resultMongo = await _usersRepository.RemoveClassificationFromListAsync(idUser, idCompany, idMail, idRelated, idClassificationType);

                        if (resultMongo.errors.Count > 0)
                            result.errors.AddRange(resultMongo.errors);
                        else if (resultMongo.data == 0)
                            TraceOutputMessage(result.errors, "MongoDb don´t remove the classification", 2002);
                        else
                            result.data = resultMongo.data;
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

        public async Task<Result<long>> SelectCompanyAsync(string idUser, long idCompany)
        {
            TraceLog(parameters: new string[] { $"idUser={idUser}" , $"idCompany={idCompany}" });
            return await _usersRepository.SelectCompanyAsync(idUser, idCompany);
        }
    }
}