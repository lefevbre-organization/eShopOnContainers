namespace Lexon.API.Model
{
    public class LexonDocumentsList : MongoModel, ILexonList<LexonDocument>
    {
        public string TimeStamp { get; set; }
        public LexonDocument[] List { get; set; }
    }
}