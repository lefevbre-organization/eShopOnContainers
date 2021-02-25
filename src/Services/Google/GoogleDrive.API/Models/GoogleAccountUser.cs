using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Models
{
    using BuidingBlocks.Lefebvre.Models;
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

    public class Credential
    {

        public Guid Id { get; set; }

        public String UserId { get; set; }
        //public virtual User User { get; set; }
        public GoogleProduct Product { get; set; }
        public string GoogleMailAccount { get; set; }
        public string ClientId { get; set; }
        public string Secret { get; set; }
        public string Code { get; set; }
        public DateTime TokenCreate { get; set; }
        public int Duration { get; set; } = 0;

        public string Scope { get; set; }
        public string Token_Type { get; set; }

        public string Access_Token { get; set; }
        public string Refresh_Token { get; set; }
        public bool? Active { get; set; }
    }

    public enum GoogleProduct
    {
        Drive = 0,
        Gmail = 1,
        Calendar = 2,
        MyBussiness = 3
    }

}