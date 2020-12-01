using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories
{
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