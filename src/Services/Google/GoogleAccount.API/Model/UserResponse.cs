using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Models
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string LefebvreCredential { get; set; }
        public string _nombre { get; set; } 
        public string _primerapellido { get; set; } 
        public string _segundoapellido { get; set; } 
        public string _idEntrada { get; set; } 
        public string _estado { get; set; } 
        public int _idClienteNav { get; set; } 
        public string _login { get; set; } 
        public string _idEntradaEncriptada { get; set; } 
        public string _tipoAcceso { get; set; } 
        public string _ip { get; set; } 
        public bool _dobleoptin { get; set; } 
    }
}