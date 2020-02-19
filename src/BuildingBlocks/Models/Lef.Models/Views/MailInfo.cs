namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class MailInfo
    {

        public MailInfo()
        { }

        public MailInfo(string provider, string mailAccount, string uid)
        {
            Provider = provider;
            MailAccount = mailAccount;
            Uid = uid;
        }

        public MailInfo(string provider, string mailAccount, string uid, string folder)
             : this(provider, mailAccount, uid)
        {
            Folder = folder;
        }

        public MailInfo(string provider, string mailAccount, string uid, string folder, string subject, string date)
            :this(provider, mailAccount, uid, folder)
        {
            Subject = subject;
            Date = date;
        }

        public string Provider { get; set; }
        public string MailAccount { get; set; }
        public string Uid { get; set; }
        public string Subject { get; set; }
        public string Date { get; set; }
        public string Folder { get; set; }

    }
}