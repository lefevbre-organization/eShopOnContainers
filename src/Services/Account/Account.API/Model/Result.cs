using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Model
{
    public class Result<T>
    {
        public List<ErrorInfo> errors { get; set; }

        public T data { get; set; }
    }
}