namespace Lexon.MySql.Model
{
    /// <summary>
    /// Modelo de token para trbajar con entradas de usuario
    /// </summary>
    public class TokenModel
    {
        public string bbdd { get; set; }

        public string name { get; set; }

        public string idMail { get; set; }

        public long? idLexonUser { get; set; }

        public short? idEntityType { get; set; }

        public int? idEntity { get; set; }

        /// <summary>
        ///  Identificador de navision del cliente que se ha creado
        /// </summary>
        public string idClienteNavision { get; set; }

        /// <summary>
        ///   Fecha de espiración del token en UNIX TimeStamp. Normalmente ahora + 60 segundos. Cada token será valido durante 60 segundos desde su generación.
        /// </summary>
        public long exp { get; set; }
    }
}