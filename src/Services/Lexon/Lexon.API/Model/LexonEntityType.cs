using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Models
{
    [BsonIgnoreExtraElements]
    public class LexonEntityType : MongoModel
    {
        public long idEntity { get; set; }

        public string name { get; set; }

    }


}