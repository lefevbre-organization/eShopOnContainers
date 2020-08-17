using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Services
{
    public interface IConferenceService
    {

        Task<Result<UserConference>> GetUserAsync(string idNavisionUser, int idApp);

        Task<Result<UserConference>> PostUserAsync(UserConference user);

        Task<Result<List<ConferenceSimple>>> GetConferencesAsync(string idNavisionUser, int idApp);

        Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, int idApp, ConferenceModel conference);

        Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, int idApp, string id);
        Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, int idApp, string id);
    }
}