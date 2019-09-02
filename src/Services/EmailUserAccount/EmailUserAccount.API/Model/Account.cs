namespace EmailUserAccount.API.Model
{
    #region Using

    using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;

    #endregion

    [BsonIgnoreExtraElements]
    public class Account: MongoModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("provider")]
        public string Provider { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("defaultAccount")]
        public bool DefaultAccount { get; set; }

        public IntegrationEventLogEntry[] Events { get; set; }
    }
}