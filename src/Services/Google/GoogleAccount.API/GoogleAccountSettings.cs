namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class GoogleAccountSettings : BaseSettings
    {
        public string CollectionScope { get; set; }
        public string RedirectSuccessDriveUrl { get; set; }
        public string InternalRedirection { get; set; }
    }
}