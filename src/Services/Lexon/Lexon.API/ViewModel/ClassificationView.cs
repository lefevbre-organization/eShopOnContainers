namespace Lexon.API.Model
{
    public class ClassificationView : EntityView
    {
        public long idRelated { get; set; }
        /// <summary> string with the id of the mail to searchry>
        public string idMail { get; set; }
    }

    public class EntityView: BaseView
    {
        public short? idType { get; set; }

    }
    public class BaseView
    { 
        public string bbdd { get; set; }
        public string idUser { get; set; }
    }
}