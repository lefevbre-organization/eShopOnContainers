using System;

namespace Signature.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class SignatureDomainException : Exception
    {
        public SignatureDomainException()
        { }

        public SignatureDomainException(string message)
            : base(message)
        { }

        public SignatureDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
