namespace Account.API.Model
{
    #region Using

    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    #endregion Using

    [BsonIgnoreExtraElements]
    public class UserMail : MongoModel
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// entrada de usuario en el formato Exxxxxxx para poder operar y comporbar los permisos del usuario
        /// </summary>
        [BsonElement("user")]
        public string User { get; set; }

        /// <summary>
        /// Obsoleta, en la siguiente versión deberá usarse la coleccion de Accounts.
        /// Proveedor de correo (GO, OU, IM)
        /// </summary>
        [BsonElement("provider")]
        public string Provider { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        /// <summary>
        /// Obsoleta, en la siguiente versión deberá usarse la coleccion de Accounts.
        /// Indicador de si es la cuenta por defecto
        /// </summary>
        [BsonElement("defaultAccount")]
        public bool DefaultAccount { get; set; }

        /// <summary>
        /// Obsoleta, en la siguiente versión deberá usarse la coleccion de Accounts.
        /// identificador único usado para refrescar la pantalla de selección de cuentas
        /// </summary>
        public string guid { get; set; }

        /// <summary>
        /// Lista de cuentas asociadas a un usuario
        /// </summary>
        public List<Account> Accounts { get; set; }
    }

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
        /// Indicador de si es la cuenta por defecto
        /// </summary>
        public bool defaultAccount { get; set; }
    }
}