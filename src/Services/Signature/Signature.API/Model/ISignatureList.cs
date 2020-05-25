namespace Signature.API.Model
{
    internal interface ISignatureList<T>
    {
        long timeStamp { get; set; }
        T[] list { get; set; }
    }
}