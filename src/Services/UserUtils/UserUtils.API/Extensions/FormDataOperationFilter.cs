
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;


namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Extensions
{
    public class FormDataOperationFilter : IOperationFilter
    {

        //void IOperationFilter.Apply(OpenApiOperation operation, OperationFilterContext context)
        //{
        //    var formMediaType = context.ApiDescription.CustomAttributes()
        //        .OfType<ConsumesAttribute>()
        //        .SelectMany(attr => attr.ContentTypes)
        //        .FirstOrDefault(mediaType => mediaType == "application/x-www-form-urlencoded");

        //    //if (formMediaType != null)
        //    //    operation.Consumes = new[] { formMediaType };

        //    operation.RequestBody = new OpenApiRequestBody() { Required = true };
        //    operation.RequestBody.Content.Add("application/x-www-form-urlencoded", new OpenApiMediaType()
        //    {
        //        Schema = new OpenApiSchema()
        //        {
        //            Type = "string",
        //            Format = "form-urlencoded",
        //        },
        //    });
        //}

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            //https://www.c-sharpcorner.com/article/add-custom-parameters-in-swagger-using-asp-net-core-3-1/

            // if (operation.Parameters == null) operation.Parameters = new List<OpenApiParameter>();

            var descriptor = context.ApiDescription.ActionDescriptor as ControllerActionDescriptor;

            if (descriptor.ActionName.EndsWith("TokenPost")
                //&& descriptor.ControllerName.StartsWith("UserUtils")
                )
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
                        Format = "application/x-www-form-urlencoded",
                    },
                });

            }
        }
    }
}
