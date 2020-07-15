namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Models
{
    public class DbDocument
    {

        public float SCORE { get; set; }
        public int? POSICION { get; set; }
        public float? BOOST { get; set; }
        public string TIPO_DOCUMENTO { get; set; } // "legislación",
        public string EDF { get; set; } // "2010/112805",
        public string EDC { get; set; } // "2010/112805",
        public string EDD { get; set; } // "2010/112805",
        public string EDH { get; set; } // "2010/112805",
        public string EDJ { get; set; } // "2010/112805",
        public string EDL { get; set; } // "2010/112805",
        public string EDO { get; internal set; }
        public string EDS { get; set; } // "2010/112805",
        public string CODIGO { get; set; } // "2010/112805",
        public string DESCRIPCION { get; set; } // "2010/112805",
        public string NREF { get; set; } // "2010/112805",
        public string FECHA { get; set; } // "02-07-2010",
        public string ANCHOR { get; set; } // "ART.93",
        public string ENTRADILLA { get; set; } // "Mº DE LA PRESIDENCIA",
        public string FECHA_PUBLICACION { get; set; } // "03-07-2010",
        public string BOLETIN { get; set; } // "BOE 161/2010 de 3 de Julio de 2010",

        public DbAddPublish[] PUBLICACIONES_ADICIONALES { get; set; }

        public string[] IDIOMAS { get; set; } // ["castellano", "gallego", "catalan", "valenciano"]
        public string TITULO { get; set; } 
        public string TITULO_ABREVIADO { get; set; } 
        public string ORGANO_EMISOR { get; set; } 
        public string RANGO { get; set; } //"Real Decreto Legislativo"
        public string NUMERO { get; set; } //"1/2010"
        public string FECHA_VIGENCIA_DESDE { get; set; } //"02-07-2010"
        public bool? DEROGADA { get; set; } 
        public bool? VIGENTE { get; set; } 
        public bool? MODIFICADA { get; set; }
        public bool? VACATIO_LEGIS { get; set; }
        public DbDocFragment[] FRAGMENTOS { get; set; }
        public string RESUMEN { get; internal set; }
        public string LINK_OPEN { get; internal set; }
        public string[] AUTORES { get; internal set; }
    }
}