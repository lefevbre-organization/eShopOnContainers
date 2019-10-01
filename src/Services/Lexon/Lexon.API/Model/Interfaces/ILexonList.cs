using MongoDB.Bson;

namespace Lexon.API.Model
{
    internal interface ILexonList<T>
    {
        BsonTimestamp TimeStamp { get; set; }
        T[] List { get; set; }
    }
}