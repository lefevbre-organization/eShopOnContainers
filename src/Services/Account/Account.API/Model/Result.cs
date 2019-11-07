namespace Account.API.Model
{
    #region Using

    using System.Collections.Generic;

    #endregion

    public class Result<T>
    {
        public List<ErrorInfo> errors { get; set; }

        public T data { get; set; }
    }
}