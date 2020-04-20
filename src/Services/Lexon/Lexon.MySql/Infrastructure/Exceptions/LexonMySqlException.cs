using System;

namespace Lexon.MySql.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class LexonMySqlException : Exception
    {
        public LexonMySqlException()
        { }

        public LexonMySqlException(string message)
            : base(message)
        { }

        public LexonMySqlException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
