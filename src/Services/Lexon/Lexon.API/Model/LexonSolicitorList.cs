namespace Lexon.API.Model
{
    public class LexonSolicitorList : MongoModel, ILexonList<LexonSolicitor>
    {
        public string TimeStamp { get; set; }
        public LexonSolicitor[] List { get; set; }
    }
}