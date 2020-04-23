using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenModelBase
    {
        /// <summary>
        ///  Identificador de navision del cliente que se ha creado
        /// </summary>
        public string idClienteNavision { get; set; }

        /// <summary>
        /// loggin del usuario si se ha solicitado la entrada mediante contraseña y login
        /// </summary>
        public string login { get; set; }

        /// <summary>
        /// Contraseña del usario si se ha solicitado la entrada mediante contraseña y login
        /// </summary>
        public string password { get; set; }

        /// <summary>
        /// array de roles o tags de aplicacion a los que tiene derecho a aceder el usuario
        /// </summary>
        public List<string> roles { get; set; }

        /// <summary>
        /// Opcional: nombre del usuario
        /// </summary>
        public string name { get; set; }

        /// <summary>
        /// identificador de la aplicación
        /// </summary>
        public int idApp { get; set; }

        /// <summary>
        /// Fecha de espiración del token en UNIX TimeStamp.
        /// Normalmente ahora + 60 segundos. Cada token será valido durante 60 segundos desde su generación.
        /// </summary>
        public long exp { get; set; }
    }
}