using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public class UsersService : IUsersService
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
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            _client = _clientFactory.CreateClient();
            _client.BaseAddress = new Uri(_settings.Value.LexonMySqlUrl);
            _client.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        public async Task<long> AddClassificationToListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1)
        {
            long result = 0;
            try
            {
                GetInfoUser(idUser, out string bbdd, out int codeUser);
                //https://localhost:44393/api/v1/LexonMySql/classifications/add?idType=1&bbdd=lexon_pre_shl_02&idUser=520&idMail=asdasdasdasd&idRelated=111
                var request = new HttpRequestMessage(HttpMethod.Get,
                    $"{_settings.Value.LexonMySqlUrl}/classifications/add?idType={idClassificationType}&bbdd={bbdd}&idUser={codeUser}&idMail={idMail}&idRelated={idRelated}");

                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<int>();
                        //return result;       //todo update collection
                        var okMongo = await _usersRepository.AddClassificationToListAsync(idUser, idCompany, idMail, idRelated, idClassificationType);
                    }
                    else
                    {
                        Console.WriteLine("el servicio devuelve un codigo de error");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"error al obtener datos {ex.Message}");
            }
            return result;
        }

        //public async Task<long> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "")
        //{
        //    return await _usersRepository.AddFileToListAsync(idUser, idCompany, idFile, nameFile, descriptionFile);
        //}

        public async Task<List<LexonActuation>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            return await _usersRepository.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
        }

        public async Task<List<LexonEntityType>> GetClassificationMasterListAsync()
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/entities/masters");

                var entities = new List<LexonEntityType>();

                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        foreach (var entity in (await response.Content.ReadAsAsync<JosEntityTypeList>()).Entities)
                        {
                            entities.Add(new LexonEntityType() { name = entity.name, idEntity = entity.idEntity });
                        }
                        return entities;       //todo update collection
                    }
                    else
                    {
                        Console.WriteLine("el servicio devuelve un codigo de error");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"error al obtener datos {ex.Message}");
            }

            return await _usersRepository.GetClassificationMasterListAsync();
        }

        public async Task<List<LexonCompany>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonMySqlUrl}/companies?pageSize={pageSize}&pageIndex={pageIndex}&idUser={idUser}");

                var companies = new List<LexonCompany>();

                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        foreach (var company in (await response.Content.ReadAsAsync<JosUserCompanies>()).Companies)
                        {
                            companies.Add(new LexonCompany() { name = company.name, bbdd = company.BBDD, idCompany = company.IdCompany });
                        }
                        return companies;       //todo update collection
                    }
                    else
                    {
                        Console.WriteLine("el servicio devuelve un codigo de error");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"error al obtener datos {ex.Message}");
            }

            return await _usersRepository.GetCompaniesListAsync(idUser);
        }

        public async Task<List<LexonEntityBase>> GetEntitiesListAsync(int pageSize, int pageIndex, short idType, string idUser, long idCompany, string search)
        {
            try
            {
                GetInfoUser(idUser, out string bbdd, out int codeUser);

                //https://localhost:44393/api/v1/LexonMySql/entities/search?pageSize=10&pageIndex=0&idType=1&bbdd=lexon_pre_shl_02&idUser=520
                var request = new HttpRequestMessage(HttpMethod.Get,
                    $"{_settings.Value.LexonMySqlUrl}/entities/search?pageSize={pageSize}&pageIndex={pageIndex}&idType={idType}&bbdd={bbdd}&idUser={codeUser}");

                var entities = new List<LexonEntityBase>();

                using (var response = await _client.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var entityList = await response.Content.ReadAsAsync<JosEntityList>();
                        foreach (var entity in (entityList.Entities))
                        {
                            entities.Add(new LexonEntityBase() { name = entity.code, description = entity.Description, id = entity.idRelated });
                        }
                        return entities;       //todo update collection
                    }
                    else
                    {
                        Console.WriteLine("el servicio devuelve un codigo de error");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"error al obtener datos {ex.Message}");
            }
            return await _usersRepository.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search);
        }

        private void GetInfoUser(string idUser, out string bbdd, out int codeUser)
        {
            //todo get bbdd and code from user
            bbdd = "lexon_pre_shl_02";
            codeUser = 520;
        }

        public async Task<List<LexonUser>> GetListUsersAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<LexonUser> GetUserAsync(string idUser)
        {
            return await _usersRepository.GetAsync(idUser);
        }

        public async Task<long> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1)
        {
            return await _usersRepository.RemoveClassificationFromListAsync(idUser, idCompany, idMail, idRelated, idClassificationType);
        }

        public async Task<bool> SelectCompanyAsync(string idUser, long idCompany)
        {
            return await _usersRepository.SelectCompanyAsync(idUser, idCompany);
        }
    }
}