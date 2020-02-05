using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.API.Model
{
    public class EntitySearchById : BaseView
    {
        public short idType { get; set; }

        public long idEntity { get; set; }
    }
}