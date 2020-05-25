namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    public class LefebvreApp
    {
        public short indAcceso { get; set; }
        public string icono { get; set; }
        public int idHerramienta { get; set; }
        public string descHerramienta { get; set; }
        public string url { get; set; }

        public long Created { get; set; }
        public string Token { get; set; }
        public string urlByPass {get; set;}
        //"indAcceso":1,"icono":"lf-icon-qmemento","idHerramienta":1,"descHerramienta":"Bases de datos","url":"https://herculesppd.lefebvre.es/webclient46/login.do?ei=f3NrcnZs"
    }
}