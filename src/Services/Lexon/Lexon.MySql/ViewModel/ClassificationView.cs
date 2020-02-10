using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.MySql.Model
{
    public class ClassificationView :BaseView
    {
        public short idType { get; set; }
        public long idRelated { get; set; }

    }
}