using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IActuationsService
    {
        Task<Result<int>> AddAppointmentAsync(LexAppointment appointment, string env, string idUser);
        Task<Result<int>> RemoveAppointmentAsync(LexAppointmentSimple appointment, string env, string idUser);
        Task<Result<int>> AddAppointmentActionAsync(LexAppointmentActuation appointment, string env, string idUser);
        Task<Result<PaginatedItemsViewModel<LexActuationType>>> GetMasterActuationsAsync(string env);
        Task<Result<PaginatedItemsViewModel<LexActuation>>> GetActuationsAsync(string idType, string idUser, string env, int pageSize, int pageIndex);
        Task<Result<PaginatedItemsViewModel<LexActuation>>> GetClassificationsFromAppointmentAsync(string idAppointment, string idUser, string env, int pageSize, int pageIndex);
        Task<Result<PaginatedItemsViewModel<LexActuationCategory>>> GetActuationCategoriesAsync(string env);
    }
}