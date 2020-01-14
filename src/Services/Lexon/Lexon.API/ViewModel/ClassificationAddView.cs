namespace Lexon.API.Model
{
    public class ClassificationAddViewComplete: ClassificationView
    {
        public MailInfo[] listaMails { get; set; }
    }

    public class ClassificationAddView : ClassificationView
    {
        public string[] listaMails { get; set; }
    }
}