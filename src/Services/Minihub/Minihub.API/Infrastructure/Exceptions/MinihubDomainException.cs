using System;

namespace Minihub.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class MinihubDomainException : Exception
    {
        public MinihubDomainException()
        { }

        public MinihubDomainException(string message)
            : base(message)
        { }

        public MinihubDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
