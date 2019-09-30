using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonUser: MongoModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("idUser")]
        public string IdUser { get; set; }

        [BsonElement("idNavision")]
        public string IdNavision { get; set; }

        public string Name { get; set; }

        [BsonElement("version")]
        public short Version { get; set; }

        public LexonCompaniesList Companies { get; set; }

     
        public LexonMasters Masters { get; set; }

    }
}