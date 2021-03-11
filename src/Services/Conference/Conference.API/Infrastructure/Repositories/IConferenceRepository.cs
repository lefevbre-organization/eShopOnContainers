using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories
{
    using Models;
    using BuidingBlocks.Lefebvre.Models;
    public interface IConferenceRepository
    {
      
        Task<Result<UserConference>> GetUserAsync(string idUser, short idApp);
        Task<Result<UserConference>> GetUserByRoomAsync(string roomNameOrId);
        Task<Result<UserConference>> PostUserAsync(UserConference user);
        Task<Result<UserConference>> UpsertRoomAsync(string idUser, short idApp,  Room room);
        Task<Result<UserConference>> GetRoomAsync(string idUser, short idApp, string idRoom);
        Task<Result<int>> DeleteRoom(string idRoom);
    }
}