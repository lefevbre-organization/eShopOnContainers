namespace Lexon.API.Model
{
    public class LexonCourtsList : MongoModel, ILexonList<LexonCourt>
    {
        public string TimeStamp { get; set; }
        public LexonCourt[] List { get; set; }
    }
}