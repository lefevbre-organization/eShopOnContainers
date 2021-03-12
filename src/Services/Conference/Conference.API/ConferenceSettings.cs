
namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class ConferenceSettings: BaseSettings
    {
        public string UserUtilsUrl { get; set; }

        public string JitsiUrl { get; set; }
        public string JitsiRoomUrl { get; set; }
        public int IdAreaVideoConference { get; set; }
    }
}