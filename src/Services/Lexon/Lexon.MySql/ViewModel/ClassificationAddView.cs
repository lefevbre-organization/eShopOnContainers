namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.ViewModel
{
    public class ClassificationAddView: ClassificationView
    {
       // public string[] listaMails { get; set; }
        public MailInfo[] listaMails { get; set; }
    }

    public class MailInfo
    {
        public string idMail { get; set; }
        public string subject { get; set; }
        public string datetime { get; set; }
    }
}