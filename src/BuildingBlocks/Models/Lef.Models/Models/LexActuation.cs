namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class LexActuation
    {
        public int idActuation { get; set; }

        public string description { get; set; }

        public string name { get; set; }

        public long? idRelated { get; set; }

        public short entityIdType { get; set; }

        public string entityType { get; set; }

        public string idMail { get; set; }

        public string date { get; set; }
    }
}