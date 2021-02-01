﻿using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Repositories
{
    public class UserUtilsRepository : BaseClass<UserUtilsRepository>, IUserUtilsRepository
    {
        private readonly UserUtilsContext _context;
        private readonly IOptions<UserUtilsSettings> _settings;

        public UserUtilsRepository(
              IOptions<UserUtilsSettings> settings
            , IEventBus eventBus
            , ILogger<UserUtilsRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _context = new UserUtilsContext(settings, eventBus);
        }

        public async Task<Result<List<ByPassModel>>> GetListByPassAsync()
        {
            var result = new Result<List<ByPassModel>>(new List<ByPassModel>());
            try
            {
                var filter = FilterDefinition<ByPassModel>.Empty;
                result.data = await _context.ByPassModels.Find(filter).ToListAsync();

                if (result.data == null)
                    TraceError(result.errors, new UserUtilsDomainException($"Don´t recover the list of bypass urls"), "UU01", "MONGO");

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when get list of bypass urls", ex), "UU01", "MONGO");
            }
            return result;
        }

        public async Task<Result<UserUtilsModel>> PostUserAsync(UserUtilsModel user)
        {
            var result = new Result<UserUtilsModel>();
            ReviewUserModel(user);

            try
            {
                var resultReplace = await _context.UserUtils.ReplaceOneAsync(
                    GetFilterUserModel(user.idNavision),
                    user,
                    GetUpsertOptions());

                user.id = ManageCreateMessage($"Don´t insert or modify the user {user.idNavision}",
                    $"Se modifica el usuario {user.idNavision}",
                    $"Se inserta el usuario {user.idNavision} con {resultReplace.UpsertedId}",
                     result.infos, result.errors, resultReplace, "UU02");

                result.data = user;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when post a UserUtilsModel", ex), "UU02", "MONGO");
            }
            return result;
        }

        private void ReviewUserModel(UserUtilsModel user)
        {
            user.idNavision = user.idNavision.ToUpperInvariant();
            if (user.name != null)
                user.name = user.name.ToUpperInvariant();
            //  user.Created = DateTime.Now.Ticks;
            UpdateByPassInfo(user);
            user.version = _settings.Value.Version;
        }

        private void UpdateByPassInfo(UserUtilsModel user)
        {
            var listByPass = _settings.Value.ByPassUrls?.ToList();
            if (listByPass?.Count == 0)
                return;

            if (user.apps?.Length > 0)
            {
                foreach (var app in user.apps)
                {
                    var encontrado = listByPass.Find(x => x.NameService.Equals(app.descHerramienta));
                    if (encontrado?.NameService != null)
                    {
                        //  encontrado.Url = app.url;
                        var urlReplace = encontrado.UrlByPass
                            .Replace("{idUserNavision}", user.idNavision)
                            .Replace("{serviceName}", app.descHerramienta);
                        //  var actualizado = await _repository.PostByPassAsync(encontrado);
                        app.urlByPass = app.url;
                        app.url = urlReplace;
                    }
                }
            }
        }

        public async Task<Result<bool>> RemoveUserAsync(string idNavision)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.UserUtils.DeleteOneAsync(GetFilterUserModel(idNavision));

                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente el usuario {idNavision}", "UU03");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when remove a UserUtilsModel", ex), "UU03", "MONGO");
            }
            return result;
        }

        private static FilterDefinition<UserUtilsModel> GetFilterUserModel(string idNavision)
        {
            return Builders<UserUtilsModel>.Filter.Eq(u => u.idNavision, idNavision.ToUpperInvariant());
        }

        //Task<Result<LexUser>> IUserUtilsRepository.GetLexonUserAsync(string idNavision)
        //{
        //    throw new NotImplementedException();
        //}

        //public Task<Result<LexContact>> GetLexonContactsAsync(EntitySearchById search)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<Result<UserUtilsModel>> GetUserAsync(string idNavision)
        {
            var result = new Result<UserUtilsModel>();
            try
            {
                result.data = await _context.UserUtils.Find(GetFilterUserModel(idNavision)).FirstOrDefaultAsync();
                WriteInfo($"get user from repository {idNavision} with apps {result.data?.name}");

                if (result.data == null)
                    TraceError(result.errors, new UserUtilsDomainException($"Don´t recover the user {idNavision} with the list of bypass urls"), "UU04", "MONGO");
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when get the user {idNavision} with the list of bypass urls", ex), "UU04", "MONGO");
            }
            return result;
        }
    }
}