namespace Lexon.API.Model
{
    internal interface ILexonList<T>
    {
        string TimeStamp { get; set; }
        T[] List { get; set; }
    }
}