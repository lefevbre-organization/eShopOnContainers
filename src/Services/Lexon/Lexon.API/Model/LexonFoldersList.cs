namespace Lexon.API.Model
{
    public class LexonFoldersList : MongoModel, ILexonList<LexonFolder>
    {
        public string TimeStamp { get; set; }
        public LexonFolder[] List { get; set; }
    }
}