namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    public class LexonEntityBaseList : MongoModel, ILexonList<LexonEntityBase>
    {
        public long timeStamp { get; set; }
        public LexonEntityBase[] list { get; set; }
    }
}