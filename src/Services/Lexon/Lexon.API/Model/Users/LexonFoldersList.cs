namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    public class LexonFoldersList : MongoModel, ILexonList<LexonFolder>
    {
        public long timeStamp { get; set; }
        public LexonFolder[] list { get; set; }
    }
}