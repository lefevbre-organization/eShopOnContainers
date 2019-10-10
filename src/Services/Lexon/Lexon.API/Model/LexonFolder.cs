namespace Lexon.API.Model
{
    public class LexonFolder : MongoModel, IEntity
    {
        public long idFolder { get; set; }

        public string name { get; set; }

        public string path { get; set; }

        public LexonDocumentsList documents { get; set; }
        public string description { get; set; }
    }
}