namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Model
{
    public class JosActuation
    {
        public string Fecha { get; set; }
        public string Asunto { get; set; }
        public string Nombre { get; set; }
        public int Actuacion { get; set; }
        public int IdRelacion { get; set; }
        public int TipoRelacion { get; set; }

    }
}