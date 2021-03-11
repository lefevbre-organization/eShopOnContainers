namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class ClassificationContactsView: BaseView
    {
        public string[] ContactList { get; set; }

        public MailInfo mail { get; set; }

    }

    public class ContactsView
    {
        public string[] ContactList { get; set; }
        public MailInfo mail { get; set; }

    }
}