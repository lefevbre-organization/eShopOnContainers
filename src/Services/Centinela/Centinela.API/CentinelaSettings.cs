
namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class CentinelaSettings : BaseSettings
    {
        public string CentinelaUrl { get; set; }
        public string CentinelaLogin { get; set; }
        public string CentinelaPassword { get; set; }
    }
}