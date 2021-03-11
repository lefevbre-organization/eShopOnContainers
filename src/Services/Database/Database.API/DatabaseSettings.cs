
namespace Lefebvre.eLefebvreOnContainers.Services.Database.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class DatabaseSettings: BaseSettings
    {

        public string OnlineUrl { get; set; }
        public string OnlineLogin { get; set; }
        public string OnlinePassword { get; set; }

    }
}