using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Extensions
{
    public class MultiPartFormDataOperationFilter : IOperationFilter
    {
        //void IOperationFilter.Apply(OpenApiOperation operation, OperationFilterContext context)
        //{
        //    var formMediaType = context.ApiDescription.CustomAttributes()
        //        .OfType<ConsumesAttribute>()
        //        .SelectMany(attr => attr.ContentTypes)
        //        .FirstOrDefault(mediaType => mediaType == "multipart/form-data");

        //    //if (formMediaType != null)
        //    //    operation.Consumes = new[] { formMediaType };

        //    operation.RequestBody = new OpenApiRequestBody() { Required = true };
        //    operation.RequestBody.Content.Add("multipart/form-data", new OpenApiMediaType()
        //    {
        //        Schema = new OpenApiSchema()
        //        {
        //            Type = "string",
        //            Format = "multipart/form-data",
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
                    .FirstOrDefault(mediaType => mediaType == "multipart/form-data");

                //if (formMediaType != null)
                //    operation.Consumes = new[] { formMediaType };

                operation.RequestBody = new OpenApiRequestBody() { Required = true };
                operation.RequestBody.Content.Add("multipart/form-data", new OpenApiMediaType()
                {
                    Schema = new OpenApiSchema()
                    {
                        Type = "string",
                        Format = "multipart/form-data",
                    },
                });

            }
        }
    }
}
