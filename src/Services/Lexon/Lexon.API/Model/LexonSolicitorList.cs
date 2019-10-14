namespace Lexon.API.Model
{
    public class LexonSolicitorList : MongoModel, ILexonList<LexonSolicitor>
    {
        public long timeStamp { get; set; }
        public LexonSolicitor[] list { get; set; }
    }
}