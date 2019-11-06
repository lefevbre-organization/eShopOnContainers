using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public class Result<T>
    {
        public List<ErrorInfo> errors { get; set; }

        public T data { get; set; }
    }
}