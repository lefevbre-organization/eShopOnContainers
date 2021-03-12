    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    using BuidingBlocks.Lefebvre.Models;

    [BsonIgnoreExtraElements]
    public class GoogleAccountUser : MongoModel
    {

        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string LefebvreCredential { get; set; }
        public List<Credential> Credentials { get; set; }
        public bool state { get; set; }


    }
}