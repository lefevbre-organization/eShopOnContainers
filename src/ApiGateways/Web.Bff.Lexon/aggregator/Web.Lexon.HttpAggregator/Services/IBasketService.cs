using Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Services
{
    public interface IBasketService
    {
        Task<BasketData> GetById(string id);

        Task UpdateAsync(BasketData currentBasket);
    }
}