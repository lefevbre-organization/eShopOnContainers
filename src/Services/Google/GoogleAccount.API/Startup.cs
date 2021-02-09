using Autofac;
using Autofac.Extensions.DependencyInjection;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Extensions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Filters;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Middlewares;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public virtual IServiceProvider ConfigureServices(IServiceCollection services)
        {
            //services.AddGrpc(options =>
            //{
            //    options.EnableDetailedErrors = true;
            //});

            //RegisterAppInsights(services);

            //services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
            //        .AddNegotiate();


            services.AddControllers(options =>
            {
                options.Filters.Add(typeof(HttpGlobalExceptionFilter));
                options.Filters.Add(typeof(ValidateModelStateFilter));
            }) // Added for functional tests
            .AddApplicationPart(typeof(AuthController).Assembly)
            .AddApplicationPart(typeof(CredentialController).Assembly)
            .AddApplicationPart(typeof(RevokeController).Assembly)
            .AddApplicationPart(typeof(ScopeController).Assembly)
            .AddNewtonsoftJson();

            services.AddSwagger(Configuration);

            //ConfigureAuthService(services);

            services.AddCustomHealthCheck(Configuration);

            services.Configure<GoogleAccountSettings>(Configuration);

            //services.AddRedis();

            services.AddIntegrationServices(Configuration);

            services.RegisterEventBus(Configuration);

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .SetIsOriginAllowed((host) => true)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            

            // Repositories
            services.AddTransient<ICredentialRepository, CredentialRepository>();
            services.AddTransient<IAuthRepository, AuthRepository>();
            services.AddTransient<IRevokeRepository, RevokeRepository>();
            services.AddTransient<IScopeRepository, ScopeRepository>();

            // Services
            services.AddTransient<IAuthService, AuthService>();
            services.AddTransient<ICredentialService, CredentialService>();
            services.AddTransient<IRevokeService, RevokeService>();
            services.AddTransient<IScopeService, ScopeService>();
            

            services.AddOptions();
            services.AddHttpClient();

            var container = new ContainerBuilder();
            container.Populate(services);
            return new AutofacServiceProvider(container.Build());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            var pathBase = Configuration["PATH_BASE"];
            if (!string.IsNullOrEmpty(pathBase))
            {
                app.UsePathBase(pathBase);
            }

            app.UseSwagger()
               .UseSwaggerUI(setup =>
               {
                   setup.SwaggerEndpoint($"{ (!string.IsNullOrEmpty(pathBase) ? pathBase : string.Empty) }/swagger/v1/swagger.json", "GoogleAccount.API V1");
                   setup.OAuthClientId("googleaccountwaggerui");
                   setup.OAuthAppName("Google Account Swagger UI");
               });

            app.UseRouting();
            ConfigureAuth(app);

            app.UseStaticFiles();

            app.UseCors("CorsPolicy");
            app.UseEndpoints(endpoints =>
            {
                // endpoints.MapGrpcService<UsersService>();
                endpoints.MapDefaultControllerRoute();
                endpoints.MapControllers();
                //endpoints.MapGet("/_proto/", async ctx =>
                //{
                //    ctx.Response.ContentType = "text/plain";
                //    using var fs = new FileStream(Path.Combine(env.ContentRootPath, "Proto", "lexon.proto"), FileMode.Open, FileAccess.Read);
                //    using var sr = new StreamReader(fs);
                //    while (!sr.EndOfStream)
                //    {
                //        var line = await sr.ReadLineAsync();
                //        if (line != "/* >>" || line != "<< */")
                //        {
                //            await ctx.Response.WriteAsync(line);
                //        }
                //    }
                //});
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

            ConfigureEventBus(app, out IEventBus eventBus);
            //var eventBus = app.ApplicationServices.GetRequiredService<IEventBus>();

            //LexonContextSeed.SeedAsync(app, loggerFactory, eventBus)
            //    .Wait();
        }

        protected virtual void ConfigureAuth(IApplicationBuilder app)
        {
            if (Configuration.GetValue<bool>("UseLoadTest"))
            {
                app.UseMiddleware<ByPassAuthMiddleware>();
            }

            app.UseAuthentication();
            app.UseAuthorization();
        }

        //private void ConfigureAuthService(IServiceCollection services)
        //{
        //    // prevent from mapping "sub" claim to nameidentifier.
        //    JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Remove("sub");

        //    var identityUrl = Configuration.GetValue<string>("IdentityUrl");

        //    services.AddAuthentication(options =>
        //    {
        //        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        //        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        //    }).AddJwtBearer(options =>
        //    {
        //        options.Authority = identityUrl;
        //        options.Audience = "centinela";
        //        options.RequireHttpsMetadata = false;
        //    });
        //}

        private void ConfigureEventBus(IApplicationBuilder app, out IEventBus eventBus)
        {
            //TODO: implementar si se necesita suscribirse a eventos
            eventBus = app.ApplicationServices.GetRequiredService<IEventBus>();

            //eventBus.Subscribe<ProductPriceChangedIntegrationEvent, ProductPriceChangedIntegrationEventHandler>();
            //eventBus.Subscribe<OrderStartedIntegrationEvent, OrderStartedIntegrationEventHandler>();
        }
    }
}
