namespace Lexon.API.Model
{
    public class LexonSupplierList : MongoModel, ILexonList<LexonSupplier>
    {
        public long timeStamp { get; set; }
        public LexonSupplier[] list { get; set; }
    }
}