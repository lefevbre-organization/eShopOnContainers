using Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Services
{
    public interface IOrderingService
    {
        Task<OrderData> GetOrderDraftAsync(BasketData basketData);
    }
}