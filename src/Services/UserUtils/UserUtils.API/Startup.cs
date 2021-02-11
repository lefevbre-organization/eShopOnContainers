using Autofac;
using Autofac.Extensions.DependencyInjection;
using HealthChecks.UI.Client;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Extensions;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using GrpcUserutils;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Filters;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Controllers;
using Microsoft.OpenApi.Models;
using System.Collections.Generic;
using UserUtils.API.Infrastructure.Middlewares;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services
             .AddGrpc(options =>
             {
                 options.EnableDetailedErrors = true;
             }).Services
             .AddControllers(options =>
             {
                 options.Filters.Add(typeof(HttpGlobalExceptionFilter));
                 options.Filters.Add(typeof(ValidateModelStateFilter));

             }) // Added for functional tests
             .AddApplicationPart(typeof(UserUtilsController).Assembly)
             .AddApplicationPart(typeof(CentinelaController).Assembly)
             .AddApplicationPart(typeof(LexonController).Assembly)
             .AddApplicationPart(typeof(SignaturitController).Assembly)
             .AddNewtonsoftJson();

            ConfigureAuthService(services);

            services
             .AddSwagger(Configuration)
             //.AddHttpClient()
             .AddCustomHealthCheck(Configuration)
             //.AddAppInsight(Configuration)
             .AddCustomDbContext(Configuration)
             .AddCustomOptions(Configuration)
             //.Configure<UserUtilsSettings>(Configuration)
             .AddIntegrationServices(Configuration)
             .AddEventBus(Configuration)
             .AddCustomMVC(Configuration);

            var container = new ContainerBuilder();
            container.Populate(services);

            return new AutofacServiceProvider(container.Build());
        }


        private void ConfigureAuthService(IServiceCollection services)
        {
            // prevent from mapping "sub" claim to nameidentifier.
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Remove("sub");

            var identityUrl = Configuration.GetValue<string>("IdentityUrl");

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            }).AddJwtBearer(options =>
            {
                options.Authority = identityUrl;
                options.RequireHttpsMetadata = false;
                options.Audience = "userutils";
            });
        }
     

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            var pathBase = Configuration["PATH_BASE"];

            if (!string.IsNullOrEmpty(pathBase))
            {
                loggerFactory.CreateLogger<Startup>().LogDebug("Using PATH BASE '{pathBase}'", pathBase);

                app.UsePathBase(pathBase);
            }

            app.UseSwagger()
              .UseSwaggerUI(setup =>
              {
                  setup.SwaggerEndpoint($"{ (!string.IsNullOrEmpty(pathBase) ? pathBase : string.Empty) }/swagger/v1/swagger.json", "UserUtils.API V1");
                  setup.OAuthClientId("userutilsswaggerui");
                  setup.OAuthAppName("UserUtils Swagger UI");
              });

            app.UseRouting();
            app.UseCors("CorsPolicy");
            ConfigureAuth(app);
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGrpcService<GrpcUserutils.UserUtilsService>();
                endpoints.MapDefaultControllerRoute();
                endpoints.MapControllers();
                endpoints.MapGet("/_proto/", async ctx =>
                {
                    ctx.Response.ContentType = "text/plain";
                    using var fs = new FileStream(Path.Combine(env.ContentRootPath, "Proto", "userutils.proto"), FileMode.Open, FileAccess.Read);
                    using var sr = new StreamReader(fs);
                    while (!sr.EndOfStream)
                    {
                        var line = await sr.ReadLineAsync();
                        if (line != "/* >>" || line != "<< */")
                        {
                            await ctx.Response.WriteAsync(line);
                        }
                    }
                });
                endpoints.MapHealthChecks("/hc", new HealthCheckOptions()
                {
                    Predicate = _ => true,
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });
                endpoints.MapHealthChecks("/liveness", new HealthCheckOptions
                {
                    Predicate = r => r.Name.Contains("self")
                });
            });

            //app.UseHealthChecks("/hc", new HealthCheckOptions()
            //{
            //    Predicate = _ => true,
            //    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            //});

            //app.UseHealthChecks("/liveness", new HealthCheckOptions
            //{
            //    Predicate = r => r.Name.Contains("self")
            //});


            //if (env.IsDevelopment())
            //{
            //    app.UseDeveloperExceptionPage();
            //}
            //else
            //{
            //    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            //    app.UseHsts();
            //}

            //app.UseHttpsRedirection();

            //app.UseMvc();
            ConfigureEventBus(app);
        }

        protected virtual void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseAuthentication();
            app.UseAuthorization();
        }

        private void ConfigureEventBus(IApplicationBuilder app)
        {
            var eventBus = app.ApplicationServices.GetRequiredService<IEventBus>();

            //eventBus.Subscribe<AddFileToUserIntegrationEvent, AddFileToUserIntegrationEventHandler>();
        }
    }
}