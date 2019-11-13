﻿namespace Lexon.MySql
{
    public class LexonSettings
    {
        public int UserApp { get; set; }
        public string ConnectionString { get; set; }

        public StoreProcedures SP { get; set; }
    }

    public class StoreProcedures
    {
        public string GetUserDetails { get; set; }
        public string GetCompanies { get; set; }
        public string GetMasterEntities { get; set; }
        public string SearchEntities { get; set; }
        public string SearchRelations { get; set; }
        public string AddRelation { get; set; }
        public string RemoveRelation { get; set; }

    }
}