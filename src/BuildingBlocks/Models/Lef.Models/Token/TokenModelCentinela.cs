namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenModelCentinela : TokenModelBase
    {
        /// <summary>
        /// Id del usuario en la aplicación donde este logado
        /// </summary>
        public long? idUserCentinela { get; set; }
        public long? idEvaluation { get; set; }
    }
}