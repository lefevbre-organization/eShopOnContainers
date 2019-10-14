namespace Lexon.API.Model
{
    public class LexonFilesList : MongoModel, ILexonList<LexonFile>
    {
        public long timeStamp { get; set; }
        public LexonFile[] list { get; set; }
    }
}