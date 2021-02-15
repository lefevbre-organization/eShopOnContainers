namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Models
{
    internal interface ILexonList<T>
    {
        long timeStamp { get; set; }
        T[] list { get; set; }
    }
}