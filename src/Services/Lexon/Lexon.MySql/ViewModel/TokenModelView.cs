using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public class TokenModelView
    {
        /// <summary>
        ///  Identificador de navision del cliente que se ha creado
        /// </summary>
        public string idClienteNavision { get; set; }

        public string bbdd { get; set; }

        public string idMail { get; set; }
        public string provider { get; set; }
        public string mailAccount { get; set; }
        public string folder { get; set; }

        public short? idEntityType { get; set; }

        public int? idEntity { get; set; }

        public List<string> mailContacts { get; set; }
    }
}