using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.MySql.Model
{
    public class ClassificationAddView : ClassificationView
    {
        public MailInfo[] listaMails { get; set; }
    }
}