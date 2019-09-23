namespace Lexon.API.Model
{
    public class LexonSupplierList : MongoModel, ILexonList<LexonSupplier>
    {
        public string TimeStamp { get; set; }
        public LexonSupplier[] List { get; set; }
    }
}