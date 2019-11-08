namespace Account.API.Infrastructure.Exceptions
{
    #region Using

    using System;

    #endregion

    /// <summary>
    /// Exception type for app exceptions
    /// </summary>
    public class AccountDomainException : Exception
    {
        public AccountDomainException()
        { }

        public AccountDomainException(string message)
            : base(message)
        { }

        public AccountDomainException(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
