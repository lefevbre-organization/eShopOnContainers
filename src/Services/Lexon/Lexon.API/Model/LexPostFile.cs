namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Models
{
    public class LexPostFile: LexFile
    {
        public string fileName { get; set; }
        public int idFolder { get; set; }

        public short idEntityType { get; set; }
        public long idEntity { get; set; }

    }
}