namespace Lexon.API.Model
{
    public interface IEntity
    {
        long id { get; set; }
        string name { get; set; }
        string description { get; set; }
    }
}