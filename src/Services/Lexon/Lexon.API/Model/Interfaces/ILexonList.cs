using MongoDB.Bson;

namespace Lexon.API.Model
{
    internal interface ILexonList<T>
    {
        long timeStamp { get; set; }
        T[] list { get; set; }
    }
}