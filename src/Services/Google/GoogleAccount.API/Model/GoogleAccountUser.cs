using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
  

    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    [BsonIgnoreExtraElements]
    public class GoogleAccountUser : MongoModel
    {

        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public Guid myId { get; set; }
        public string LefebvreCredential { get; set; }
        public List<Credential> Credentials { get; set; }

        /// <summary>
        /// Lista de cuentas asociadas a un usuario
        /// </summary>
        public List<Credential> accounts { get; set; }

        public bool state { get; set; }


    }
}