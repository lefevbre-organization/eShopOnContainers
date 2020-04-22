using System.Collections.Generic;

namespace UserUtils.API.Models
{
    public class TokenModelBase
    {
        /// <summary>
        ///  Identificador de navision del cliente que se ha creado
        /// </summary>
        public string idClienteNavision { get; set; }
        public string login { get; set; }
        public string password { get; set; }
        public List<string> roles { get; set; }

        /// <summary>
        ///   Fecha de espiración del token en UNIX TimeStamp. Normalmente ahora + 60 segundos. Cada token será valido durante 60 segundos desde su generación.
        /// </summary>
        public long exp { get; set; }

    }

    public class TokenData
    {
        public string token { get; set; }

        public bool valid { get; set; }

    }
}