using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class Result<T>
    {
        public Result()
        {
            errors = new List<ErrorInfo>();
        }

        public Result(T t) : this()
        {
            data = t;
        }

        public Result(T t, List<ErrorInfo> errores) : this(t)
        {
            errors = errores;
        }

        public List<ErrorInfo> errors { get; set; }

        public T data { get; set; }
    }
}