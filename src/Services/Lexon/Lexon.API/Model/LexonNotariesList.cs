namespace Lexon.API.Model
{
    public class LexonNotariesList : MongoModel, ILexonList<LexonNotary>
    {
        public long timeStamp { get; set; }
        public LexonNotary[] list { get; set; }
    }
}