using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class GoogleAccountDomainException : Exception
    {
        public GoogleAccountDomainException()
        { }

        public GoogleAccountDomainException(string message)
            : base(message)
        { }

        public GoogleAccountDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
