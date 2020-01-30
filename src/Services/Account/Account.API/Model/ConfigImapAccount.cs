namespace Account.API.Model
{


    /// <summary>
    /// Clase para configurar los datos por defecto de un proveeddor de imap
    /// </summary>
    public class ConfigImapAccount
    {
        public string imap { get; set; }
        public short imapPort { get; set; }
        public string imapUser { get; set; }
        public string imapPass { get; set; }
        public bool imapSsl { get; set; }
        public string smtp { get; set; }
        public short smtpPort { get; set; }
        public bool smtpSsl { get; set; }

    }
}