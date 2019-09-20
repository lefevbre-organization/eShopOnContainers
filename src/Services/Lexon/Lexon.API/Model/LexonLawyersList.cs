namespace Lexon.API.Model
{
    public class LexonLawyersList : MongoModel, ILexonList<LexonLawyer>
    {
        public string TimeStamp { get; set; }
        public LexonLawyer[] List { get; set; }
    }
}