using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class DatabaseDomainException : Exception
    {
        public DatabaseDomainException()
        { }

        public DatabaseDomainException(string message)
            : base(message)
        { }

        public DatabaseDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
