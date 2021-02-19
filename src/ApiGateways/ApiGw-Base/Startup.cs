using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System;
using HealthChecks.UI.Client;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using OcelotApiGw.Extensions;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace OcelotApiGw
{
    public class Startup
    {
        private readonly IConfiguration _cfg;

        public Startup(IConfiguration configuration)
        {
            _cfg = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {

            services.AddHealthChecks()
                .AddCheck("self", () => HealthCheckResult.Healthy())
                //.AddUrlGroup(new Uri(_cfg["AccountApiUrlHC"]), name: "accountsapi-check", tags: new string[] { "accountsapi" })
                //.AddUrlGroup(new Uri(_cfg["CentinelaApiUrlHC"]), name: "centinelaapi-check", tags: new string[] { "centinelaapi" })
                //.AddUrlGroup(new Uri(_cfg["ConferenceApiUrlHC"]), name: "conferenceapi-check", tags: new string[] { "conferenceapi" })
                //.AddUrlGroup(new Uri(_cfg["LexonApiUrlHC"]), name: "lexonapi-check", tags: new string[] { "lexonapi" })
                //.AddUrlGroup(new Uri(_cfg["SignatureApiUrlHC"]), name: "signatureapi-check", tags: new string[] { "signatureapi" })
                //.AddUrlGroup(new Uri(_cfg["UserUtilsApiUrlHC"]), name: "userutilsapi-check", tags: new string[] { "userutilsapi" })
                //.AddUrlGroup(new Uri(_cfg["DatabaseApiUrlHC"]), name: "databaseapi-check", tags: new string[] { "databaseapi" })
                ;

            ConfigureAuthService(services);
            services
                .AddCustomMVC()
                .AddOcelot(_cfg);

            services.Configure<KestrelServerOptions>(options =>
            {
                options.Limits.MaxRequestBodySize = 5200000000; // if don't set default value is: 30 MB
            });
        }

        private void ConfigureAuthService(IServiceCollection services)
        {
            // prevent from mapping "sub" claim to nameidentifier.
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Remove("sub");

            var identityUrl = _cfg.GetValue<string>("IdentityUrl");
            //var authenticationProviderKey = "IdentityApiKey";

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            }).AddJwtBearer(options =>
            {
                options.Authority = identityUrl;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters()
                {
                    ValidAudiences = new[] { "orders", "basket", "locations", "marketing", "mobileshoppingagg", "webshoppingagg" }
                };
                options.Events = new JwtBearerEvents()
                {
                    OnAuthenticationFailed = async ctx =>
                    {
                        int i = 0;
                    },
                    OnTokenValidated = async ctx =>
                    {
                        int i = 0;
                    },

                    OnMessageReceived = async ctx =>
                    {
                        int i = 0;
                    }
                };
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var pathBase = _cfg["PATH_BASE"];

            if (!string.IsNullOrEmpty(pathBase))
            {
                app.UsePathBase(pathBase);
            }

            //if (env.IsDevelopment())
            //{
            //    app.UseDeveloperExceptionPage();
            //}

            app.UseHealthChecks("/hc", new HealthCheckOptions()
            {
                Predicate = _ => true,
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.UseHealthChecks("/liveness", new HealthCheckOptions
            {
                Predicate = r => r.Name.Contains("self")
            });

            app.UseCors("CorsPolicy");

            app.UseOcelot().Wait();
        }
    }
}
