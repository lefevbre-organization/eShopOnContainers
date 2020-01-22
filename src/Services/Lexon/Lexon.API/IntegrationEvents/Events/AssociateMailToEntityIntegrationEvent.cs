namespace Lexon.API.IntegrationsEvents.Events
{

    public class AssociateMailToEntityIntegrationEvent: DissociateMailFromEntityIntegrationEvent
    {

        public string SubjectMail { get; set; }
        public string DateMail { get; set; }


        public AssociateMailToEntityIntegrationEvent(
            long idAppNavision,
            string userId,
            string assocTypeEntity,
            long associatedId,
            string provider,
            string mailAccount,
            string uidMail,
            string subjectmail,
            string dateMail
            ):base(idAppNavision, userId, assocTypeEntity, associatedId, provider, mailAccount, uidMail)
        {

            SubjectMail = subjectmail;
            DateMail = dateMail;
        }

    }

}