using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonCompany : MongoModel, IName, ISelected
    {
        [BsonElement("idCompany")]
        public long IdCompany { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("logo")]
        public string Logo { get; set; }

        [BsonElement("conn")]
        public string Conn { get; set; }

        [BsonElement("selected")]
        public bool Selected { get; set; }

        public LexonClientsList Clients { get; set; }
        public LexonInsurancesList Insurances { get; set; }
        public LexonSupplierList Suppliers { get; set; }

        public LexonCourtsList Courts { get; set; }
        public LexonFilesList Files { get; set; }
        public LexonLawyersList Lawyers { get; set; }
        public LexonSolicitorList Solicitors { get; set; }
        public LexonNotariesList Notaries { get; set; }
        public LexonFoldersList Folders { get; set; }
    }
}