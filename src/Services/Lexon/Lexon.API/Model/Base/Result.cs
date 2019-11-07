using System.Collections.Generic;

namespace Lexon.API.Model
{
    public class Result<T>
    {
        public List<ErrorInfo> errors { get; set; }

        public T data { get; set; }
    }
}