using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class GoogleAccountScope
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Url { get; set; }

        public string Name { get; set; }

        public GoogleProduct Product { get; set; }

        public bool state { get; set; }
    }

}