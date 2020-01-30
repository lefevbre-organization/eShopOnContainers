namespace Account.API.Model
{

    /// <summary>
    /// Nos da la información de las conexiones del mail con otras entidades de lexón 
    /// </summary>
    public class MailRelation
    {
        /// <summary>
        /// identificador único del mail
        /// </summary>
        public string uid { get; set; }

        public string app { get; set; }
        public int idEntity { get; set; }
        public short idType { get; set; }

    }
}