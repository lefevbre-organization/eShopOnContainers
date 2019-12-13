using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonFoldersList : ILexonList<LexonFolder> //: MongoModel, ILexonList<LexonFolder>
    {
        public long timeStamp { get; set; }
        public LexonFolder[] list { get; set; }
    }
}