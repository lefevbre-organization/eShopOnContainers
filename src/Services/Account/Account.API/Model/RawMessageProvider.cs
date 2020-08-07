namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Model
{
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;

    public class RawMessageProvider
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// entrada de usuario en el formato Exxxxxxx para poder operar y comprobar los permisos del usuario
        /// </summary>
        [BsonElement("user")]
        public string User { get; set; }

        public string Account { get; set; }

        public string Provider { get; set; }
        public string MessageId { get; set; }
        public string Raw { get; set; }
    }
}