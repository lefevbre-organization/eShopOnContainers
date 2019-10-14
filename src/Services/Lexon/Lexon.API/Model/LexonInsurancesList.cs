namespace Lexon.API.Model
{
    public class LexonInsurancesList : MongoModel, ILexonList<LexonInsurance>
    {
        public long timeStamp { get; set; }
        public LexonInsurance[] list { get; set; }
    }
}