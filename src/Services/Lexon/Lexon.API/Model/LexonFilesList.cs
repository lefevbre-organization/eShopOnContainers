namespace Lexon.API.Model
{
    public class LexonFilesList : MongoModel, ILexonList<LexonFile>
    {
        public string TimeStamp { get; set; }
        public LexonFile[] List { get; set; }
    }
}