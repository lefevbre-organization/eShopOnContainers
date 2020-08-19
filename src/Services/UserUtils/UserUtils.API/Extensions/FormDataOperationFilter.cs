using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Extensions
{
    public class FormDataOperationFilter : IOperationFilter
    {
        public void Apply(Operation operation, OperationFilterContext context)
        {
            var formMediaType = context.ApiDescription.ActionAttributes()
                .OfType<ConsumesAttribute>()
                .SelectMany(attr => attr.ContentTypes)
                .FirstOrDefault(mediaType => mediaType == "application/x-www-form-urlencoded");

            if (formMediaType != null)
                operation.Consumes = new[] { formMediaType };
        }
    }
}
