using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonCompany : MongoModel, ICompany //,IEntity
    {
        public long idCompany { get; set; }

        public string name { get; set; }

        public string description { get; set; }
        public string bbdd { get; set; }

        public bool selected { get; set; }

        public LexonClientsList clients { get; set; }
        public LexonClientsList opposites { get; set; }
        public LexonInsurancesList insurances { get; set; }
        public LexonSupplierList suppliers { get; set; }

        public LexonCourtsList courts { get; set; }
        public LexonFilesList files { get; set; }
        public LexonLawyersList lawyers { get; set; }
        public LexonLawyersList opposingLawyers { get; set; }
        public LexonSolicitorList solicitors { get; set; }
        public LexonSolicitorList opposingSolicitors { get; set; }
        public LexonNotariesList notaries { get; set; }
        public LexonFoldersList folders { get; set; }
    }
}