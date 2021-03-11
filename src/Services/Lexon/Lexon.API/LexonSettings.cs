
namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class LexonSettings : BaseSettings, IEnvSettings
    {
        public EnvironmentModel[] EnvModels { get; set; }
        public string[] Environments { get; set; }
        public string DefaultEnvironment { get; set; }
        public SPSettings SP { get; set; }
        public bool UseMongo { get; set; }
        public string CollectionMasters { get; set; }
    }
}