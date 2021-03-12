namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    /// <summary>
    /// Clase utilizada en la obtención de información de login
    /// </summary>
    public class ServiceComUser
    {
        
        public string _nombre { get; set; }
        public string _primerapellido { get; set; }
        public string _segundoapellido { get; set; }
        public string _idEntrada { get; set; }
        public string _estado { get; set; }
        public int? _idClienteNav { get; set; }
        public string _login { get; set; }
        public string _idEntradaEncriptada { get; set; }
        public string _tipoAcceso { get; set; }
        public string _ip { get; set; }
        public bool? _dobleoptin { get; set; }


        public string name
        {
            get {
                var myName = string.IsNullOrEmpty(_nombre) ? "" : _nombre;
                var myApe1 = string.IsNullOrEmpty(_primerapellido) ? "" : $" {_primerapellido}";
                var myApe2 = string.IsNullOrEmpty(_segundoapellido) ? "" : $" {_segundoapellido}";
                return $"{myName}{myApe1}{myApe2}"; 
            }
        }

    }
}