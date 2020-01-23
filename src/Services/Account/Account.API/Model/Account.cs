namespace Account.API.Model
{
    #region Using

    using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    #endregion

    [BsonIgnoreExtraElements]
    public class UserMail: MongoModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("provider")]
        public string Provider { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("defaultAccount")]
        public bool DefaultAccount { get; set; }

        public string guid { get; set; }

        public List<Account> Accounts { get; set; }
    }

        [BsonIgnoreExtraElements]
        public class Account
        {
            public string provider { get; set; }

            public string email { get; set; }

            public string guid { get; set; }

            public bool defaultAccount { get; set; }

        }
}