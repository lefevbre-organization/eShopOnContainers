namespace Lexon.API.Model
{
    public class LexonClientsList : MongoModel, ILexonList<LexonClient>
    {
        public string TimeStamp { get; set; }
        public LexonClient[] List { get; set; }
    }
}