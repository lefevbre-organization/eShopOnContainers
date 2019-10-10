namespace Lexon.API.Model
{
    public class LexonNotary : MongoModel, IEntity
    {
        public int idNotary { get; set; }

        public string name { get; set; }
        public string description { get; set; }
    }
}