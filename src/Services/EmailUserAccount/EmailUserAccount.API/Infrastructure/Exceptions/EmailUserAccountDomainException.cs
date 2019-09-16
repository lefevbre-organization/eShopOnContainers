namespace Account.API.Infrastructure.Exceptions
{
    #region Using

    using System;

    #endregion

    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class EmailUserAccountDomainException : Exception
    {
        public EmailUserAccountDomainException()
        { }

        public EmailUserAccountDomainException(string message)
            : base(message)
        { }

        public EmailUserAccountDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
