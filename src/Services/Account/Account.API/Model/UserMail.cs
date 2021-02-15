namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Model
{
    #region Using

    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    #endregion Using

    [BsonIgnoreExtraElements]
    public class UserMail //: MongoModel
    {

        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// entrada de usuario en el formato Exxxxxxx para poder operar y comprobar los permisos del usuario
        /// </summary>
        [BsonElement("user")]
        public string User { get; set; }


        public ConfigUserLexon configUser { get; set; }


        /// <summary>
        /// Lista de cuentas asociadas a un usuario
        /// </summary>
        public List<Account> accounts { get; set; }
        public bool state { get; set; }


    }
}