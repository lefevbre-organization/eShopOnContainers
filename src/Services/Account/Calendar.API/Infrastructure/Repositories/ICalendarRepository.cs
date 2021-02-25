namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Repositories
{
    using Model;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using System.Threading.Tasks;
  
    public interface ICalendarRepository
    {
        Task<Result<CalendarUser>> GetCalendarUser(string idNavision, string idNextCloud);
        Task<Result<CalendarUser>> UpsertCalendarUser(CalendarUser accountIn);
        Task<Result<bool>> RemoveCalendarUser(string idNavision);
        Task<Result<bool>> RemoveCalendar(string idNavision, string idNextCloud, string idCalendar);
        Task<Result<Calendar>> AddCalendar(string idNavision, string idNextCloud, Calendar calendar);
    }
}