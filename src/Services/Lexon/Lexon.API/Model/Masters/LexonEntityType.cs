using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityType : MongoModel
    {
        public long idEntity { get; set; }

        public string name { get; set; }

    }

    public enum LexonAssociationType
    {
        MailToFilesEvent = 1,
        MailToClientsEvent = 2,
        MailToOppositesEvent = 3,
        MailToSuppliersEvent = 4,
        MailToLawyersEvent = 5,
        MailToOpposingLawyersEvent = 6,
        MailToSolicitorsEvent = 7,
        MailToOpposingSolicitorsEvent = 8,
        MailToNotariesEvent = 9,
        MailToCourtsEvent = 10,
        MailToInsurancesEvent = 11,
        MailToOthersEvent = 12,
        MailToFoldersEvent = 13,
        MailToDocumentsEvent = 14

    }


}