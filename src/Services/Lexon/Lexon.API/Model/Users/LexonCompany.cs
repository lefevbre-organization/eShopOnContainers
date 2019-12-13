using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonCompany // : MongoModel
    {
        public long idCompany { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public string bbdd { get; set; }

        public bool selected { get; set; }

        public LexonEntityBaseList clients { get; set; }
        public LexonEntityBaseList opposites { get; set; }
        public LexonEntityBaseList insurances { get; set; }
        public LexonEntityBaseList suppliers { get; set; }
        public LexonEntityBaseList courts { get; set; }
        public LexonEntityBaseList files { get; set; }
        public LexonEntityBaseList lawyers { get; set; }
        public LexonEntityBaseList opposingLawyers { get; set; }
        public LexonEntityBaseList solicitors { get; set; }
        public LexonEntityBaseList opposingSolicitors { get; set; }
        public LexonEntityBaseList notaries { get; set; }

        //TODO: poner folder
       // public LexonFoldersList folders { get; set; }
    }
}