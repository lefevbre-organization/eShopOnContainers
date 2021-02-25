using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Services
{
    public interface IConferenceService
    {
        Task<Result<UserConference>> GetUserAsync(string idNavisionUser, short idApp);

        Task<Result<UserConference>> GetUserByRoomAsync(string roomNameOrId);

        Task<Result<UserConference>> PostUserAsync(UserConference user);

        Task<Result<List<ConferenceSimple>>> GetActiveConferencesAsync();

        Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, short idApp, ConferenceModel conference);

        Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, short idApp, string id);

        Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, short idApp, string id);

        Task<Result<UserReservation>> CreateReservationAsync(UserReservationRequest reservation);

        Task<Result<UserConference>> CreateRoomAsync(string idNavision, string name, short idApp);

        Task<Result<UserRoom>> NotifyRoomAsync(string idNavision, short idApp, Room room);

        Task<Result<UserRoom>> SecureRoomAsync(string roomNameOrId, string pass);
        Task<Result<int>> DeleteRoomAsync(string idRoom);
        Task<Result<bool>> CheckUserAsync(string idNavision, short idApp);
    }
}