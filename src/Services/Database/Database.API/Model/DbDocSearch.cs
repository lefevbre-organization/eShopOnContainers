namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Models
{
    public class DbDocSearch
    {
        public long? NUMERO_DOCUMENTOS { get; set; }
        public long? NUMERO_RESULTADOS { get; set; }
        public string CONSULTA { get; set; }
        public string LINK_SEARCH { get; set; }
        public DbDocument[] DOCUMENTOS { get; set; }
       // public Faceta[] FACETAS { get; set; }

        //{"NUMERO_DOCUMENTOS":0,"NUMERO_RESULTADOS":0,"DOCUMENTOS":[],"FACETAS":[]}
    }
}