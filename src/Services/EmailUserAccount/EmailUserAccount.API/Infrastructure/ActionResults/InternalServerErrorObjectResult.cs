namespace EmailUserAccount.API.Infrastructure.ActionResults
{
    #region

    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;

    #endregion

    public class InternalServerErrorObjectResult : ObjectResult
    {
        public InternalServerErrorObjectResult(object error)
            : base(error)
        {
            StatusCode = StatusCodes.Status500InternalServerError;
        }
    }
}
