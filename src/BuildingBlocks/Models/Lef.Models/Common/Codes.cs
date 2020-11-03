namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public static class Codes
    {
        public static class LexonActuations
        {
            public static readonly string UpsertAppointment = "LX50";
            public static readonly string RemoveAppointment = "LX51";
            public static readonly string AddAppointmentAction = "LX52";
            public static readonly string RemoveAppointmentAction = "LX53";
            public static readonly string GetRelationsOfAppointment = "LX54";

            public static readonly string GetActuationTypes = "LX60";
            public static readonly string GetActuationCategories = "LX61";
            public static readonly string GetActuations = "LX62";
            public static readonly string AddAction = "LX63";
        }
        public static class LexonAdvisors
        {
            public static readonly string GetAdvisorFiles = "LX70";
            public static readonly string GetAdvisorContacts = "LX71";

        }

        public static class Lexon
        {
            public static readonly string Generic = "LX00";
            public static readonly string GetUser = "LX02";
            public static readonly string GetCompaniesUser = "LX03";
            public static readonly string GetUserId = "LX04";

            public static readonly string AddClassificationToList = "LX10";
            public static readonly string AddContactsToMail = "LX11";
            public static readonly string RemoveClassificationFromList = "LX12";
            public static readonly string GetClassificationFromList = "LX13";
            public static readonly string GetEntities = "LX14";
            public static readonly string GetEntity = "LX15";
            public static readonly string GetEntityTypes = "LX16";
            public static readonly string CheckRelationsMail = "LX17";

            public static readonly string GetContact = "LX20";
            public static readonly string GetAllContacts = "LX21";

            public static readonly string GetFolders = "LX30";
            public static readonly string GetNestedFolders = "LX31";
            public static readonly string AddFolderToEntity = "LX32";

            public static readonly string GetFile = "LX40";
            public static readonly string PostFile = "LX41";
        }
    }
}