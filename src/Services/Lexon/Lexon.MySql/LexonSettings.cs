namespace Lexon.MySql
{
    public class LexonSettings
    {
        public string ConnectionString { get; set; }

        public StoreProcedures SP { get; set; }
    }

    public class StoreProcedures
    {
        public string GetCompanies { get; set; }
        public string GetMasterEntities { get; set; }
        public string SearchEntities { get; set; }

    }
}