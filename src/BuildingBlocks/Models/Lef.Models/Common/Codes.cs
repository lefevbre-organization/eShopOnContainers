namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public static class Codes
    {
        public static class MailAccounts
        {
            public static readonly string UserCreate = "AC01";
            public static readonly string UserUpsert = "AC02";
            public static readonly string UserGet = "AC03";
            public static readonly string UserStateChangue = "AC04";
            public static readonly string UserConfigUpsert = "AC05";
            public static readonly string UserRemove = "AC06";

            public static readonly string AccountGet = "AC10";
            public static readonly string AccountGetDefault = "AC11";
            public static readonly string AccountRemove = "AC12";
            public static readonly string AccountResetDefault = "AC13";
            public static readonly string AccountUpsert = "AC14";
            public static readonly string AccountConfigUpsert = "AC15";

            public static readonly string RelationUpsert = "AC20";
            public static readonly string RelationRemove = "AC21";
            public static readonly string RelationGet = "AC22";

            public static readonly string RawGet = "AC30";
            public static readonly string RawCreate = "AC31";
            public static readonly string RawRemove = "AC32";

            public static readonly string EventTypeGet = "AC40";
            public static readonly string EventTypeUpsert = "AC41";
            public static readonly string EventTypeRemove = "AC42";
            public static readonly string EventTypeAdd = "AC43";
            public static readonly string EventTypeAccountRemove = "AC44";

        }

        public static class LexonActuations
        {
            public static readonly string UpsertAppointment = "LX50";
            public static readonly string RemoveAppointment = "LX51";
            public static readonly string AddAppointmentAction = "LX52";
            public static readonly string RemoveAppointmentAction = "LX53";
            public static readonly string GetRelationsOfAppointment = "LX54";
            public static readonly string GetAppointments = "LX55";


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

        public static class UserUtils
        {
            public static readonly string UserEncode = "UU10";
            public static readonly string UserDecode = "UU11";
            public static readonly string GetHub = "UU12";
            public static readonly string GetUserLef = "UU13";
            public static readonly string GetAreas = "UU14";
            public static readonly string ByPass = "UU15";
            public static readonly string ByPassSignature = "UU16";
            
            public static readonly string GetToken = "UU20";
            public static readonly string GetLexonUser = "UU21";
            public static readonly string GetLexonContact = "UU22";
            
            public static readonly string FirmCheck = "UU30";
            public static readonly string FirmCheckAvaliable = "UU31";
            public static readonly string FirmUse = "UU32";
        }

        public static class Centinela
        {
            public static readonly string GetFile = "CE01";
            public static readonly string PostFile = "CE02";
            public static readonly string GetEvaluations = "CE03";
            public static readonly string GetContacts = "CE04";
            public static readonly string GetDocuments = "CE05";
            public static readonly string GetEvaluationTree = "CE06";
            public static readonly string GetConcepts = "CE07";
            public static readonly string GetDocInstance = "CE08";
            public static readonly string CancelSignature = "CE09";
            public static readonly string CertificationPost = "CE10";
            public static readonly string GetSmsContacts = "CE11";

        }
        public static class Areas
        {
            public static readonly string Api = "API";
            public static readonly string Hub = "HUBSVC";
            public static readonly string Com = "SVCCOMSVC";
            public static readonly string Claves = "CLAVESSVC";
            public static readonly string Jitsi = "JITSISVC";
            public static readonly string InternalApi = "APISVC";
            public static readonly string Online = "ONLINESVC";
            public static readonly string Centinela = "CENTINELASVC";
            public static readonly string MySqlConn = "MYSQLCONN";
            public static readonly string MySql = "MYSQL";
            public static readonly string Mongo = "MONGO";
            public static readonly string Google = "GOOGLE";
        }

        public static class Conferences
        {
            public static readonly string Create = "CN01";
            public static readonly string Get = "CN02";
            public static readonly string GetConferences = "CN03";
            public static readonly string Modify = "CN04";
            public static readonly string Remove = "CN05";
            public static readonly string CheckUser = "CN06" ;

            public static readonly string GetStats = "CN10";
            
            public static readonly string RoomCreate = "CN20";
            public static readonly string RoomModify = "CN21";
            public static readonly string RoomNotify = "CN22";
            public static readonly string RoomSecure = "CN23";
            public static readonly string RoomReservation = "CN24";
            public static readonly string RoomGet = "CN25";
        }

        public static class GoogleDrive
        {
            public static readonly string Create = "GD01";
            public static readonly string GetFiles = "GD02";
            public static readonly string GetToken = "GD03";
            public static readonly string Delete = "GD04";
            public static readonly string Trash = "GD05";
            public static readonly string GetRoot = "GD06";
            public static readonly string CreateFolder = "GD07";
            public static readonly string UploadFile = "GD08";
            public static readonly string DownloadFile = "GD09";
            public static readonly string MoveElement = "GD10";
            public static readonly string RenameElement = "GD11";
            public static readonly string ExportMimeType = "GD12";
        }

        public static class GoogleAccount
        {
            public static readonly string Create = "GA01";
            public static readonly string Get = "GA02";
            public static readonly string Delete = "GA03";
            public static readonly string GetCredentials ="GA04";
            public static readonly string UpdateCredentials = "GA05";
            public static readonly string GoogleAuthorization = "GA06";
        }
    }
}