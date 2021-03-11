using System;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Exceptions
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class CalendarDomainException : Exception
    {
        public CalendarDomainException()
        { }

        public CalendarDomainException(string message)
            : base(message)
        { }

        public CalendarDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
