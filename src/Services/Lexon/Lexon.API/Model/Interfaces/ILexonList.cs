using MongoDB.Bson;

namespace Lexon.API.Model
{
    internal interface ILexonList<T>
    {
        long TimeStamp { get; set; }
        T[] List { get; set; }
    }
}