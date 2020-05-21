using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading;
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

        public async Task<Result<ByPassModel>> GetByPassAsync(string nameService)
        {
            var result = new Result<ByPassModel>();
            try
            {
                result.data = await _context.ByPassModels.Find(GetFilterByPassModel(nameService)).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún servicio {nameService}"), "ErrorByPassGet");
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<List<ByPassModel>>> GetListByPassAsync()
        {
            var result = new Result<List<ByPassModel>>(new List<ByPassModel>());
            try
            {
                var filter = FilterDefinition<ByPassModel>.Empty;
                result.data = await _context.ByPassModels.Find(filter).ToListAsync();

                if (result.data == null)
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún servicio en bypass"), "ErrorByPassGet");
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<ByPassModel>> PostByPassAsync(ByPassModel byPass)
        {
            var result = new Result<ByPassModel>();
            ReviewByPassModel(byPass);

            try
            {
                var resultReplace = await _context.ByPassModels.ReplaceOneAsync(
                    GetFilterByPassModel(byPass.NameService),
                    byPass,
                    GetUpsertOptions());

                byPass.id = ManageCreateByPassMessage($"Don´t insert or modify the service {byPass.NameService}",
                    $"Se modifica el servicio {byPass.NameService}",
                    $"Se inserta el servicio {byPass.NameService} con {resultReplace.UpsertedId}",
                     result, resultReplace);

                result.data = byPass;

            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }


        private string ManageCreateByPassMessage(
            string msgError, 
            string msgModify, 
            string msgInsert, 
            Result<ByPassModel> result, 
            ReplaceOneResult resultReplace)
        {
            if (resultReplace.IsAcknowledged)
            {
                if (resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, msgModify);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, msgInsert);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceMessage(result.errors, new Exception(msgError), "CreateRawError");
            }
            return null;
        }

        private static UpdateOptions GetUpsertOptions()
        {
            return new UpdateOptions { IsUpsert = true };
        }

        private void ReviewByPassModel(ByPassModel byPass)
        {
            byPass.NameService= byPass.NameService.ToUpperInvariant();
            //byPass.UrlByPass = byPass.UrlByPass.ToUpperInvariant();
            byPass.Created = DateTime.Now.Ticks;

        }

        public async Task<Result<bool>> RemoveByPassAsync(ByPassModel byPass)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.ByPassModels.DeleteOneAsync(GetFilterByPassModel(byPass.NameService));

                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente el byPass de {byPass.NameService}");
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        private static FilterDefinition<ByPassModel> GetFilterByPassModel(string nameService)
        {
            return Builders<ByPassModel>.Filter.Eq(u => u.NameService, nameService.ToUpperInvariant());
        }


 


    }
}