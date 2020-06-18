namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Models
{
    public class DocumentsCount
    {
        public long? mementos { get; set; }
        public long? actum { get; set; }
        public long? jurisprudencia { get; set; }
        public long? doctrina { get; set; }
        public long? legislacion { get; set; }
        public long? convenios { get; set; }
        public long? comentarios { get; set; }
        public long? formularios { get; set; }
        public long? formulariosEfl { get; set; }
        public long? consultas { get; set; }
        public long? ejemplos { get; set; }
        public long? casos_practicos { get; set; }
        public long? doctrina_libros { get; set; }
        public long? doctrina_articulos { get; set; }
        public long? otros { get; set; }
    }

    public class DocumentsSearch
    {
        public long? NUMERO_DOCUMENTOS { get; set; }
        public long? NUMERO_RESULTADOS { get; set; }
        public Document[] DOCUMENTOS { get; set; }
        public Faceta[] FACETAS { get; set; }

        //{"NUMERO_DOCUMENTOS":0,"NUMERO_RESULTADOS":0,"DOCUMENTOS":[],"FACETAS":[]}
    }

    public class Faceta
    {
    }

    public class Document
    {
    }
}