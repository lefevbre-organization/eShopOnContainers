using Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Services
{
    public interface IOrderApiClient
    {
        Task<OrderData> GetOrderDraftFromBasketAsync(BasketData basket);
    }
}