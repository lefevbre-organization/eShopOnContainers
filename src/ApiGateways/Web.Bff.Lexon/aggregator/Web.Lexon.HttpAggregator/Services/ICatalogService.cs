using Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Services
{
    public interface ICatalogService
    {
        Task<CatalogItem> GetCatalogItemAsync(int id);

        Task<IEnumerable<CatalogItem>> GetCatalogItemsAsync(IEnumerable<int> ids);
    }
}