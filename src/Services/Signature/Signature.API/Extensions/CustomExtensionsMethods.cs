using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBusRabbitMQ;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Extensions
{
    using Infrastructure.Repositories;
    using Infrastructure.Services;
    using Microsoft.OpenApi.Models;

    public static class CustomExtensionsMethods
    {
        //public static IServiceCollection AddAppInsight(this IServiceCollection services, IConfiguration configuration)
        //{
        //    return services;
        //}

        public static IServiceCollection AddCustomMVC(this IServiceCollection services, IConfiguration configuration)
        {
            //services.AddMvc(options =>
            //{
            //    options.Filters.Add(typeof(HttpGlobalExceptionFilter));
            //})
            //    .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
            //    .AddControllersAsServices();

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .SetIsOriginAllowed((host) => true)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.AddTransient<ISignaturesService, SignaturesService>();
            services.AddTransient<ISignaturesRepository, SignaturesRepository>();
            services.AddTransient<IBrandingsService, BrandingsService>();
            services.AddTransient<IBrandingsRepository, BrandingsRepository>();
            services.AddTransient<ISignaturitService, SignaturitService>();
            services.AddTransient<IEmailsService, EmailsService>();
            services.AddTransient<IEmailsRepository, EmailsRepository>();
            services.AddTransient<ISmsService, SmsService>();
            services.AddTransient<ISmsRepository, SmsRepository>();
            services.AddTransient<IDocumentsService, DocumentsService>();
            services.AddTransient<IDocumentsRepository, DocumentsRepository>();

            return services;
        }

        public static IServiceCollection AddCustomHealthCheck(this IServiceCollection services, IConfiguration configuration)
        {
            var hcBuilder = services.AddHealthChecks();

            hcBuilder
                .AddCheck("self", () => HealthCheckResult.Healthy())
                .AddMongoDb(
                    configuration["ConnectionString"],
                    name: "Signature-mongodb-check",
                    tags: new string[] { "mongodb" })
                .AddRabbitMQ(
                    $"amqp://{configuration["EventBusConnection"]}",
                    name: "Signature-rabbitmqbus-check",
                    tags: new string[] { "rabbitmqbus" });

            return services;
        }

        public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            return services;
        }

        public static IServiceCollection AddCustomOptions(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<SignatureSettings>(configuration);
            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Instance = context.HttpContext.Request.Path,
                        Status = StatusCodes.Status400BadRequest,
                        Detail = "Please refer to the errors property for additional details."
                    };

                    return new BadRequestObjectResult(problemDetails)
                    {
                        ContentTypes = { "application/problem+json", "application/problem+xml" }
                    };
                };
            });

            return services;
        }

        public static IServiceCollection AddSwagger(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSwaggerGen(op =>
            {
                op.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Lefebvre Now - Signature HTTP API",
                    Version = "v1",
                    Description = "The Signature Microservice HTTP API. This is a Data-Driven/CRUD microservice sample",
                    //TODO: conseguir uri: TermsOfService = "Terms Of Service"
                });

                //c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                //{
                //    Type = SecuritySchemeType.OAuth2,
                //    Flows = new OpenApiOAuthFlows()
                //    {
                //        Implicit = new OpenApiOAuthFlow()
                //        {
                //            AuthorizationUrl = new Uri($"{configuration.GetValue<string>("IdentityUrlExternal")}/connect/authorize"),
                //            TokenUrl = new Uri($"{configuration.GetValue<string>("IdentityUrlExternal")}/connect/token"),
                //            Scopes = new Dictionary<string, string>()
                //            {
                //                { "signature", "Signature API" }
                //            }
                //        }
                //    }
                //});
            });

            return services;
        }

        public static IServiceCollection AddIntegrationServices(this IServiceCollection services, IConfiguration configuration)
        {
            if (configuration.GetValue<bool>("AzureServiceBusEnabled"))
            {
                //no implementado y posiblemente no se necesite
            }
            else
            {
                services.AddSingleton<IRabbitMQPersistentConnection>(sp =>
                {
                    var settings = sp.GetRequiredService<IOptions<SignatureSettings>>().Value;
                    var logger = sp.GetRequiredService<ILogger<DefaultRabbitMQPersistentConnection>>();
                    var factory = new ConnectionFactory
                    {
                        HostName = configuration["EventBusConnection"],
                    };

                    if (!string.IsNullOrEmpty(configuration["EventBusUserName"]))
                        factory.UserName = configuration["EventBusUserName"];

                    if (!string.IsNullOrEmpty(configuration["EventBusPassword"]))
                        factory.Password = configuration["EventBusPassword"];

                    var retryCount = settings.EventBusRetryCount != 0 ? settings.EventBusRetryCount : 5;

                    return new DefaultRabbitMQPersistentConnection(factory, logger, retryCount);
                });
            }
            return services;
        }

        public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
        {
            var subscriptionClientName = configuration["SubscriptionClientName"];
            //var subscriptionConsumerName = configuration["SubscriptionConsumerName"];

            if (configuration.GetValue<bool>("AzureServiceBusEnabled"))
            {
                //no implementado y posiblemente no se necesite
            }
            else
            {
                //services.AddSingleton<IEventBus, EventBusRabbitMQ>(sp =>
                //{
                //    var rabbitMQPersistentConnection = sp.GetRequiredService<IRabbitMQPersistentConnection>();
                //    var iLifetimeScope = sp.GetRequiredService<ILifetimeScope>();
                //    var logger = sp.GetRequiredService<ILogger<EventBusRabbitMQ>>();
                //    var eventBusSubcriptionsManager = sp.GetRequiredService<IEventBusSubscriptionsManager>();

                //    var retryCount = 5;
                //    if (!string.IsNullOrEmpty(configuration["EventBusRetryCount"]))
                //        retryCount = int.Parse(configuration["EventBusRetryCount"]);

                //    //return new EventBusRabbitMQ(rabbitMQPersistentConnection, logger, iLifetimeScope, eventBusSubcriptionsManager, subscriptionClientName, subscriptionConsumerName, retryCount);
                //    return new EventBusRabbitMQ(rabbitMQPersistentConnection, logger, iLifetimeScope, eventBusSubcriptionsManager, subscriptionClientName, retryCount);
                //});
            }
            //services.AddSingleton<IEventBusSubscriptionsManager, InMemoryEventBusSubscriptionsManager>();
            //services.AddTransient<AddFileToUserIntegrationEventHandler>();

            return services;
        }
    }
}