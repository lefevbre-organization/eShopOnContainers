using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Services
{
    public interface IConferenceService
    {
        Task<Result<UserConference>> GetUserAsync(string idNavisionUser, short idApp);

        Task<Result<UserConference>> PostUserAsync(UserConference user);

        Task<Result<List<ConferenceSimple>>> GetConferencesAsync(string idNavisionUser, short idApp);

        Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, short idApp, ConferenceModel conference);

        Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, short idApp, string id);

        Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, short idApp, string id);

        Task<UserReservation> CreateReservationAsync(UserReservationRequest reservation);

        Task<Result<UserConference>> CreateRoomAsync(string idNavision, string name, short idApp);

        Task<Result<UserRoom>> NotifyRoomAsync(string idNavision, string name, short idApp);

        Task<Result<UserRoom>> SecureRoomAsync(string idNavision, string idRoom, string pass, short idApp);
    }
}