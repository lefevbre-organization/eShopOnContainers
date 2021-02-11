
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;


namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Extensions
{
    public class FormDataOperationFilter : IOperationFilter
    {

        void IOperationFilter.Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formMediaType = context.ApiDescription.CustomAttributes()
                .OfType<ConsumesAttribute>()
                .SelectMany(attr => attr.ContentTypes)
                .FirstOrDefault(mediaType => mediaType == "application/x-www-form-urlencoded");

            //if (formMediaType != null)
            //    operation.Consumes = new[] { formMediaType };

            operation.RequestBody = new OpenApiRequestBody() { Required = true };
            operation.RequestBody.Content.Add("application/x-www-form-urlencoded", new OpenApiMediaType()
            {
                Schema = new OpenApiSchema()
                {
                    Type = "string",
                    Format = "form-urlencoded",
                },
            });
        }
    }
}
