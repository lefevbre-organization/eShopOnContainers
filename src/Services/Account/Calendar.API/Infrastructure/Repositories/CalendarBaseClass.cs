using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Repositories
{
    using Infrastructure.Exceptions;

    public class CalendarBaseClass<T>: BaseClass<T>
    {
        public CalendarBaseClass(ILogger<T> logger):base(logger)
        { }

        public string ManageUpsert<T>(string msgError, string msgModify, string msgInsert, Result<T> result, ReplaceOneResult resultReplace, string code)
        {
            if (resultReplace.IsAcknowledged)
            {
                if (resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, msgModify, code);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, msgInsert, code);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceError(result.errors, new CalendarDomainException(msgError), code);
            }
            return null;
        }

        public void ManageUpdate(string errorMsg, string modifyMsg, Result<bool> result, UpdateResult resultUpdate, string code)
        {
            if (resultUpdate.IsAcknowledged)
            {
                if (resultUpdate.MatchedCount == 0)
                {
                    TraceInfo(result.infos, "No se encuentran datos, asegurese que el usuario existe y esta activo", code);
                }
                else if (resultUpdate.MatchedCount > 0)
                {
                    if (resultUpdate.ModifiedCount == 0)
                        TraceInfo(result.infos, "Se encuentran datos pero no se han producido actualizaciones", code);
                    else
                        TraceInfo(result.infos, modifyMsg, code);

                    result.data = resultUpdate.ModifiedCount > 0;
                }
            }
            else
            {
                TraceError(result.errors, new CalendarDomainException(errorMsg), code);
            }
        }
    }
}