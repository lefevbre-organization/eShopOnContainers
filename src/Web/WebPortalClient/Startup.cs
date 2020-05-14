﻿using eShopOnContainers.WebSPA;
//using Microsoft.ApplicationInsights.Extensibility;
//using Microsoft.ApplicationInsights.ServiceFabric;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using StackExchange.Redis;
using System;
using System.IO;
using WebSPA.Infrastructure;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace eShopConContainers.WebSPA
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        private IHostingEnvironment _hostingEnv;
        public Startup(IHostingEnvironment env)
        {
            _hostingEnv = env;

            var localPath = new Uri(Configuration["ASPNETCORE_URLS"])?.LocalPath ?? "/";
            Configuration["BaseUrl"] = localPath;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            //RegisterAppInsights(services);

            services.AddHealthChecks()
                .AddUrlGroup(new Uri(Configuration["PortalUrlHC"]), name: "webportal-check", tags: new string[] { "webportal" })
                //.AddCheck("self", () => HealthCheckResult.Healthy())
                .AddUrlGroup(new Uri(Configuration["LexonApiUrlHC"]), name: "lexonapi-check", tags: new string[] { "lexonapi" })
                //.AddUrlGroup(new Uri(Configuration["LexonMySqlApiUrlHC"]), name: "lexonmysqlapi-check", tags: new string[] { "lexonmysqlapi" })
                //.AddUrlGroup(new Uri(Configuration["LexonApiGatewayUrlHC"]), name: "lexonapigw-check", tags: new string[] { "lexonapigw" })
                .AddUrlGroup(new Uri(Configuration["AccountApiUrlHC"]), name: "accountapi-check", tags: new string[] { "accountapigw" })
                //.AddUrlGroup(new Uri(Configuration["AccountApiGatewayUrlHC"]), name: "accountapigw-check", tags: new string[] { "accountapigw" })
                //.AddUrlGroup(new Uri(Configuration["IdentityUrlHC"]), name: "identityapi-check", tags: new string[] { "identityapi" })
                ;

            services.Configure<AppSettings>(Configuration);

            if (Configuration.GetValue<string>("IsClusterEnv") == bool.TrueString)
            {
                services.AddDataProtection(opts =>
                {
                    opts.ApplicationDiscriminator = "eshop.webspa";
                })
                .PersistKeysToRedis(ConnectionMultiplexer.Connect(Configuration["DPConnectionString"]), "DataProtection-Keys");
            }

            services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                });
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IAntiforgery antiforgery)
        {
            //loggerFactory.AddApplicationInsights(app.ApplicationServices, LogLevel.Trace);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHealthChecks("/liveness", new HealthCheckOptions
            {
                Predicate = r => r.Name.Contains("self")
            });

            app.UseHealthChecks("/hc", new HealthCheckOptions()
            {
                Predicate = _ => true,
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            // Configure XSRF middleware, This pattern is for SPA style applications where XSRF token is added on Index page 
            // load and passed back token on every subsequent async request            
            // app.Use(async (context, next) =>
            // {
            //     if (string.Equals(context.Request.Path.Value, "/", StringComparison.OrdinalIgnoreCase))
            //     {
            //         var tokens = antiforgery.GetAndStoreTokens(context);
            //         context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions() { HttpOnly = false });
            //     }
            //     await next.Invoke();
            // });

            //Seed Data
            WebContextSeed.Seed(app, env, loggerFactory);

            var pathBase = Configuration["PATH_BASE"];
            if (!string.IsNullOrEmpty(pathBase))
            {
                loggerFactory.CreateLogger<Startup>().LogDebug("Using PATH BASE '{pathBase}'", pathBase);
                app.UsePathBase(pathBase);
            }

            app.Use(async (context, next) =>
            {
                await next();

                // If there's no available file and the request doesn't contain an extension, we're probably trying to access a page.
                // Rewrite request to use app root
                if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value) && !context.Request.Path.Value.StartsWith("/api"))
                {
                    context.Request.Path = "/index.html"; 
                    context.Response.StatusCode = 200; // Make sure we update the status code, otherwise it returns 404
                    await next();
                }
            });
            
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseMvcWithDefaultRoute();
        }

        //private void RegisterAppInsights(IServiceCollection services)
        //{
        //    services.AddApplicationInsightsTelemetry(Configuration);
        //    var orchestratorType = Configuration.GetValue<string>("OrchestratorType");

        //    if (orchestratorType?.ToUpper() == "K8S")
        //    {
        //        // Enable K8s telemetry initializer
        //        services.AddApplicationInsightsKubernetesEnricher();
        //    }
        //    if (orchestratorType?.ToUpper() == "SF")
        //    {
        //        // Enable SF telemetry initializer
        //        services.AddSingleton<ITelemetryInitializer>((serviceProvider) =>
        //            new FabricTelemetryInitializer());
        //    }
        //}
    }
}
