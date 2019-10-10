namespace Lexon.API.Model
{
    public class LexonClientsList : MongoModel, ILexonList<LexonClient>
    {
        public long timeStamp { get; set; }
        public LexonClient[] list { get; set; }
    }
}