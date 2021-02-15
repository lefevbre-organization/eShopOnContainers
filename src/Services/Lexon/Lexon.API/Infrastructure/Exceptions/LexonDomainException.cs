using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class LexonDomainException : Exception
    {
        public LexonDomainException()
        { }

        public LexonDomainException(string message)
            : base(message)
        { }

        public LexonDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
