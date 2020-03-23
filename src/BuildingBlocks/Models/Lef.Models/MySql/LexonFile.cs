namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class LexonPostFile: LexonFile
    {
        public string fileName { get; set; }
        public int idFolder { get; set; }

        public long idAction { get; set; }
        public short idTypeEntity { get; set; }
        public long idEntity { get; set; }

    }

    public class LexonFile
    {
        public long idCompany { get; set; }
        public string idUser { get; set; }
    }

    public class LexonGetFile : LexonFile 
    {

        public long idDocument { get; set; }

    }
}