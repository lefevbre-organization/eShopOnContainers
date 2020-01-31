using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    /// <summary>
    /// Modelo de token para trbajar con entradas de usuario
    /// </summary>
    public class TokenModel : TokenModelView
    {

        public string name { get; set; }
        /// <summary>
        /// Id del usuario en la aplicación donde este logado
        /// </summary>
        public long? idUserApp { get; set; }


        public List<string> roles { get; set; }

        /// <summary>
        ///   Fecha de espiración del token en UNIX TimeStamp. Normalmente ahora + 60 segundos. Cada token será valido durante 60 segundos desde su generación.
        /// </summary>
        public long exp { get; set; }
    }
}