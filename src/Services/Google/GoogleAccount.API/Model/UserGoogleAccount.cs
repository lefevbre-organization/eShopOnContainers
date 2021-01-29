using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class UserGoogleAccount
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string idNavision { get; set; }
        public short idApp { get; set; }


    }
}