namespace Lexon.API.Model
{
    public class LexonCompaniesList : MongoModel, ILexonList<LexonCompany>
    {
        public string TimeStamp { get; set; }
        public LexonCompany[] List { get; set; }
    }
}