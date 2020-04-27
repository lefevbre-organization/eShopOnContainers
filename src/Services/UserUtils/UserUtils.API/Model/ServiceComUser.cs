namespace UserUtils.API.Models
{
    public class ServiceComUser
    {
        
        //{"_nombre":"Francisco","_primerapellido":"Reyes","_segundoapellido":"Bardasano",
        //"_pwd":null,"_idEntrada":"E1639056","_estado":"activa",
        //"_email":"f.reyes-ext@lefebvreelderecho.com",
        //"_idClienteNav":51,"_idClienteCrm":0,"_numConcurrencias":"0","_idCliente":616267,
        //"_login":"f.reyes-ext@lefebvreelderecho.com","_idEntradaEncriptada":"eHRpd3ZkYA%3D%3D",
        //"_tipoAcceso":"Usuario + Pwd","_ip":"","_fechaCreacionFormateada":"19/07/2018","_tratamiento":"","_dobleoptin":false}
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

    public class ServiceComArea
    {
        //{"idArea":10,"descArea":"Análisis de Novedades","idExterno":-1,"indAdmin":0}
        public int idArea { get; set; }
        public string descArea { get; set; }
        public int? idExterno { get; set; }
        public int? indAdmin { get; set; }
    }
}