namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Models
{

    public class LexFile
    {
        public long idCompany { get; set; }
        public string idUser { get; set; }
    }

    public class LexGetFile: LexFile
    {
        public long? idDocument { get; set; }

    }


}