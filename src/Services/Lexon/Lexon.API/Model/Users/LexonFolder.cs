namespace Lexon.API.Model
{
    public class LexonFolder : LexonEntityBase
    {
        public string path { get; set; }

        public LexonEntityBaseList documents { get; set; }
    }
}