namespace Account.API.Model
{
    #region Using

    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    #endregion Using

    [BsonIgnoreExtraElements]
    public class Account
    {
        /// <summary>
        /// Proveedor de correo (GO, OU, IM)
        /// </summary>
        public string provider { get; set; }

        /// <summary>
        /// Dirección de correo en formato xxxx@xxxx.xxx
        /// </summary>
        public string email { get; set; }

        /// <summary>
        /// identificador único usado para refrescar la pantalla de selección de cuentas
        /// </summary>
        public string guid { get; set; }

        /// <summary>
        /// firma en formato html que asociar al correo
        /// </summary>
        public string sign { get; set; }

        /// <summary>
        /// Indicador de si es la cuenta por defecto
        /// </summary>
        public bool defaultAccount { get; set; }

        public ConfigImapAccount configAccount { get; set; }

        /// <summary>
        /// Lista de mails asociadas a programa externo
        /// </summary>
        public List<MailRelation> mails { get; set; }
    }
}