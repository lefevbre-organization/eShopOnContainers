using System;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class UserUtilsDomainException : Exception
    {
        public UserUtilsDomainException()
        { }

        public UserUtilsDomainException(string message)
            : base(message)
        { }

        public UserUtilsDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
