namespace Lefebvre.eLefebvreOnContainers.Models
{
    public class JosActuation
    {
        public string Fecha { get; set; }
        public string Asunto { get; set; }
        public string Nombre { get; set; }
        public int Actuacion { get; set; }
        public int IdRelacion { get; set; }
        public short TipoRelacion { get; set; }
        public string Interviniente { get; set; }

    }
}