namespace Signature.API.IntegrationsEvents.Events
{
    public class DissociateMailFromEntityIntegrationEvent: SignatureBaseIntegrationEvent
    {

        public long AssociatedId { get; set; }
        public string AssociatedType { get; set; }
        public string MailAccount { get; set; }
        public string Provider { get; set; }
        public string UidMail { get; set; }


        public DissociateMailFromEntityIntegrationEvent(
            long idAppNavision,
            string userId,
            string assocTypeEntity,
            long assocEntity,
            string provider,
            string mailAccount,
            string uidMail
              ) : base(idAppNavision, userId)
        {
            AssociatedType = assocTypeEntity;
            AssociatedId = assocEntity;
            Provider = provider;
            MailAccount = mailAccount;
            UidMail = uidMail;
        }
    }

}