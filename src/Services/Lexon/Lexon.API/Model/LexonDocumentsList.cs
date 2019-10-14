namespace Lexon.API.Model
{
    public class LexonDocumentsList : MongoModel, ILexonList<LexonDocument>
    {
        public long timeStamp { get; set; }
        public LexonDocument[] list { get; set; }
    }
}