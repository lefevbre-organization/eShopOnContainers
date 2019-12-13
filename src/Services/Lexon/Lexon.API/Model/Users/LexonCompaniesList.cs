using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonCompaniesList : ILexonList<LexonCompany>// MongoModel, ILexonList<LexonCompany>
    {
        public long timeStamp { get; set; }
        public LexonCompany[] list { get; set; }
    }
}