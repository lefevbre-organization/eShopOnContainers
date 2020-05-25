using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    [BsonIgnoreExtraElements]
    public class UserSignatures// : MongoModel
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

        [BsonElement("availableSignatures")]
        public int availableSignatures { get; set; }

        public List<UserBranding> brandings { get; set; }

        public List<Signature> signatures { get; set; }
    }
}
