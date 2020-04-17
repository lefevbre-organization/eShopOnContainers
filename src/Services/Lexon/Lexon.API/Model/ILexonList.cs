namespace Centinela.API.Model
{
    internal interface ILexonList<T>
    {
        long timeStamp { get; set; }
        T[] list { get; set; }
    }
}