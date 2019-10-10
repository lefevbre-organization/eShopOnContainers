namespace Lexon.API.Model
{
    public class LexonLawyersList : MongoModel, ILexonList<LexonLawyer>
    {
        public long timeStamp { get; set; }
        public LexonLawyer[] list { get; set; }
    }
}