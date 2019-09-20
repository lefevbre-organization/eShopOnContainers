namespace Lexon.API.Model
{
    public class LexonInsurancesList : MongoModel, ILexonList<LexonInsurance>
    {
        public string TimeStamp { get; set; }
        public LexonInsurance[] List { get; set; }
    }
}