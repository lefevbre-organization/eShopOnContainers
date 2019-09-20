namespace Lexon.API.Model
{
    public class LexonNotariesList : MongoModel, ILexonList<LexonNotary>
    {
        public string TimeStamp { get; set; }
        public LexonNotary[] List { get; set; }
    }
}