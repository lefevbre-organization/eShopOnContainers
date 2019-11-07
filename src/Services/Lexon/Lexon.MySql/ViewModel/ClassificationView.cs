namespace Lexon.MySql.Model
{
    public class ClassificationView
    {
        public short idType { get; set; }
        public string bbdd { get; set; }
        public string idUser { get; set; }
        public long idRelated { get; set; }
        public long idCompany { get; set; }
    }
}