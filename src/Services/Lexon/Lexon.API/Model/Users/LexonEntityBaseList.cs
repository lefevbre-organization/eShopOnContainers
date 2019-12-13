using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityBaseList : ILexonList<LexonEntityBase> // MongoModel, ILexonList<LexonEntityBase>
    {
        public long timeStamp { get; set; }
        public LexonEntityBase[] list { get; set; }
    }
}