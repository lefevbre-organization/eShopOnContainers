using System;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class BaseDomainException : Exception
    {
        public BaseDomainException()
        { }

        public BaseDomainException(string message)
            : base(message)
        { }

        public BaseDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
