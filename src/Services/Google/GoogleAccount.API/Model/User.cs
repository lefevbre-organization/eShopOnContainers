using System;
using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    #region Using

    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    #endregion Using

    public class User
    {

        public User()
        {
            Credentials = new HashSet<Credential>();
        }

        public Guid Id { get; set; }
        public string LefebvreCredential { get; set; }
        public IEnumerable<Credential> Credentials { get; set; }
        
    }

 
    [BsonIgnoreExtraElements]
    public class GoogleAccountUser : MongoModel
    {

        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public Guid myId { get; set; }
        public string LefebvreCredential { get; set; }
        public IEnumerable<Credential> Credentials { get; set; }

        /// <summary>
        /// Lista de cuentas asociadas a un usuario
        /// </summary>
        public List<Credential> accounts { get; set; }

        public bool state { get; set; }


    }
}