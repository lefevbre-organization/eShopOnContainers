using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonMasters
    {
        
        public LexonEntityList Entities { get; set; }
    }
}