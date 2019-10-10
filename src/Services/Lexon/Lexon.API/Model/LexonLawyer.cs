namespace Lexon.API.Model
{
    public class LexonLawyer : MongoModel, IEntity
    {
        public int idLawyer { get; set; }

        public string description { get; set; }

        public string name { get; set; }
    }
}