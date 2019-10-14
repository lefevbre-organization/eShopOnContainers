namespace Lexon.API.Model
{
    public class LexonCompaniesList : MongoModel, ILexonList<LexonCompany>
    {
        public long timeStamp { get; set; }
        public LexonCompany[] list { get; set; }
    }
}