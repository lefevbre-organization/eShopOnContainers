namespace Lexon.API.Model
{
    public class LexonLawyer : MongoModel, IEntity
    {
        public long id { get; set; }

        public string description { get; set; }

        public string name { get; set; }
    }
}