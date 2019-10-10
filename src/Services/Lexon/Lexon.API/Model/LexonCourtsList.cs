namespace Lexon.API.Model
{
    public class LexonCourtsList : MongoModel, ILexonList<LexonCourt>
    {
        public long timeStamp { get; set; }
        public LexonCourt[] list { get; set; }
    }
}