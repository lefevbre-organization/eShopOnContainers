using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class CentinelaDomainException : Exception
    {
        public CentinelaDomainException()
        { }

        public CentinelaDomainException(string message)
            : base(message)
        { }

        public CentinelaDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
