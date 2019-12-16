using Lefebvre.eLefebvreOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Model
{
    [BsonIgnoreExtraElements]
    public class MailAccount //: MongoModel
    {
        [BsonId]
        [BsonIgnoreIfDefault]
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