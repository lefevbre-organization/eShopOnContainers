using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class ConferenceDomainException : Exception
    {
        public ConferenceDomainException()
        { }

        public ConferenceDomainException(string message)
            : base(message)
        { }

        public ConferenceDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
