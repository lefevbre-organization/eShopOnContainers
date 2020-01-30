namespace Account.API.Model
{
    #region Using

    #endregion Using

    /// <summary>
    /// Clase que permite configurar el correo
    /// </summary>
    public class ConfigUserLexon
    {
        /// <summary>
        /// Indica si se realizan operaciones sincronicas de obtener contactos desde lexon
        /// </summary>
        public bool getContacts { get; set; }

        /// <summary>
        /// Indica la operativa por defecto del usuario cuando vaya a adjuntar un correo a lexon u otro programa
        /// Puede ser: "onlyAdjunction", "saveAtachments" "saveMail"
        /// </summary>
        public string defaultAdjunction { get; set; }

        /// <summary>
        /// Entidad por defecto a la que se adjunta el mail si no se elije otra opción
        /// Puede ser: "files", "contacts" "saveMail"
        /// </summary>
        public string defaultEntity { get; set; }

    }
}