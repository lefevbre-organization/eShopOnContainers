namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Services
{
    #region Using

    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Threading.Tasks;
    #endregion

    public interface ICalendarService
    {
        Task<Result<CalendarUser>> GetCalendarUser(string idNavision, string idNextCloud);
        Task<Result<CalendarUser>> UpsertCalendarUser(CalendarUser accountIn);
        Task<Result<bool>> RemoveCalendarUser(string idNavision);
        Task<Result<bool>> RemoveCalendar(string idNavision, string idNextCloud, string idCalendar);
        Task<Result<Calendar>> AddCalendar(string idNavision, string idNextCloud, Calendar calendar);
    }
}