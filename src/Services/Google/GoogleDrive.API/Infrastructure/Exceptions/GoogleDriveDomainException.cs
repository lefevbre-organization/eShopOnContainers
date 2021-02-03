using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class GoogleDriveDomainException : Exception
    {
        public GoogleDriveDomainException()
        { }

        public GoogleDriveDomainException(string message)
            : base(message)
        { }

        public GoogleDriveDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
