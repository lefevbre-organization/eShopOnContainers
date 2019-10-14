﻿using Lexon.MySql.Infrastructure.Filters;
using Lexon.MySql.Infrastructure.Repositories;
using Lexon.MySql.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lexon.MySql.Extensions
{
    public static class CustomExtensionsMethods
    {
        public static IServiceCollection AddAppInsight(this IServiceCollection services, IConfiguration configuration)
        {
            return services;
        }

        public static IServiceCollection AddCustomMVC(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddMvc(options =>
            {
                options.Filters.Add(typeof(HttpGlobalExceptionFilter));
            })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
                .AddControllersAsServices();

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .SetIsOriginAllowed((host) => true)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.AddTransient<ILexonMySqlService, LexonMySqlService>();
            services.AddTransient<ILexonMySqlRepository, LexonMySqlRepository>();
            return services;
        }

        //public static IServiceCollection AddCustomHealthCheck(this IServiceCollection services, IConfiguration configuration)
        //{
        //    //TODO: review and stimate comment or test services
        //    var accountName = configuration.GetValue<string>("AzureStorageAccountName");
        //    var accountKey = configuration.GetValue<string>("AzureStorageAccountKey");

        //    var hcBuilder = services.AddHealthChecks();

        //    hcBuilder
        //        .AddCheck("self", () => HealthCheckResult.Healthy())
        //        .AddMongoDb(
        //            configuration["ConnectionString"],
        //            name: "lexon-mongodb-check",
        //            tags: new string[] { "mongodb" });

        //    if (!string.IsNullOrEmpty(accountName) && !string.IsNullOrEmpty(accountKey))
        //    {
        //        hcBuilder
        //            .AddAzureBlobStorage(
        //                $"DefaultEndpointsProtocol=https;AccountName={accountName};AccountKey={accountKey};EndpointSuffix=core.windows.net",
        //                name: "catalog-storage-check",
        //                tags: new string[] { "lexonstorage" });
        //    }

        //    if (configuration.GetValue<bool>("AzureServiceBusEnabled"))
        //    {
        //        hcBuilder
        //            .AddAzureServiceBusTopic(
        //                configuration["EventBusConnection"],
        //                topicName: "lexon_event_bus",
        //                name: "lexon-servicebus-check",
        //                tags: new string[] { "servicebus" });
        //    }
        //    else
        //    {
        //        hcBuilder
        //            .AddRabbitMQ(
        //                $"amqp://{configuration["EventBusConnection"]}",
        //                name: "lexon-rabbitmqbus-check",
        //                tags: new string[] { "rabbitmqbus" });
        //    }

        //    return services;
        //}

        public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            return services;
        }

        //public static IServiceCollection AddCustomOptions(this IServiceCollection services, IConfiguration configuration)
        //{
        //    services.Configure<LexonSettings>(configuration);
        //    services.Configure<ApiBehaviorOptions>(options =>
        //    {
        //        options.InvalidModelStateResponseFactory = context =>
        //        {
        //            var problemDetails = new ValidationProblemDetails(context.ModelState)
        //            {
        //                Instance = context.HttpContext.Request.Path,
        //                Status = StatusCodes.Status400BadRequest,
        //                Detail = "Please refer to the errors property for additional details."
        //            };

        //            return new BadRequestObjectResult(problemDetails)
        //            {
        //                ContentTypes = { "application/problem+json", "application/problem+xml" }
        //            };
        //        };
        //    });

        //    return services;
        //}

        public static IServiceCollection AddSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.DescribeAllEnumsAsStrings();
                options.SwaggerDoc("v1", new Swashbuckle.AspNetCore.Swagger.Info
                {
                    Title = "Lefebvre Now - Lexon MySql",
                    Version = "v1",
                    Description = "This is direct search in mysql databases, created only by preview job in develop",
                    TermsOfService = "Terms Of Service"
                });
            });

            return services;
        }

        //public static IServiceCollection AddIntegrationServices(this IServiceCollection services, IConfiguration configuration)
        //{
        //    if (configuration.GetValue<bool>("AzureServiceBusEnabled"))
        //    {
        //        //no implementado y posiblemente no se necesite
        //    }
        //    else
        //    {
        //        services.AddSingleton<IRabbitMQPersistentConnection>(sp =>
        //        {
        //            var settings = sp.GetRequiredService<IOptions<LexonSettings>>().Value;
        //            var logger = sp.GetRequiredService<ILogger<DefaultRabbitMQPersistentConnection>>();
        //            var factory = new ConnectionFactory
        //            {
        //                HostName = settings.EventBus.HostName,
        //                DispatchConsumersAsync = true
        //            };

        //            if (!string.IsNullOrEmpty(settings.EventBus.Username))
        //                factory.UserName = settings.EventBus.Username;

        //            if (!string.IsNullOrEmpty(settings.EventBus.Password))
        //                factory.Password = settings.EventBus.Password;

        //            //if (settings.EventBus.Port != 0)
        //            //    factory.Port = settings.EventBus.Port;

        //            //if (!string.IsNullOrEmpty(settings.EventBus.VirtualHost))
        //            //    factory.VirtualHost = settings.EventBus.VirtualHost;

        //            var retryCount = settings.EventBus.RetryCount != 0 ? settings.EventBus.RetryCount : 5;

        //            return new DefaultRabbitMQPersistentConnection(factory, logger, retryCount);
        //        });
        //    }
        //    return services;
        //}

        //public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
        //{
        //    var subscriptionClientName = configuration["SubscriptionClientName"];
        //    //var subscriptionConsumerName = configuration["SubscriptionConsumerName"];

        //    if (configuration.GetValue<bool>("AzureServiceBusEnabled"))
        //    {
        //        //no implementado y posiblemente no se necesite
        //    }
        //    else
        //    {
        //        services.AddSingleton<IEventBus, EventBusRabbitMQ>(sp =>
        //        {
        //            var rabbitMQPersistentConnection = sp.GetRequiredService<IRabbitMQPersistentConnection>();
        //            var iLifetimeScope = sp.GetRequiredService<ILifetimeScope>();
        //            var logger = sp.GetRequiredService<ILogger<EventBusRabbitMQ>>();
        //            var eventBusSubcriptionsManager = sp.GetRequiredService<IEventBusSubscriptionsManager>();

        //            var retryCount = 5;
        //            if (!string.IsNullOrEmpty(configuration["EventBusRetryCount"]))
        //                retryCount = int.Parse(configuration["EventBusRetryCount"]);

        //            //return new EventBusRabbitMQ(rabbitMQPersistentConnection, logger, iLifetimeScope, eventBusSubcriptionsManager, subscriptionClientName, subscriptionConsumerName, retryCount);
        //            return new EventBusRabbitMQ(rabbitMQPersistentConnection, logger, iLifetimeScope, eventBusSubcriptionsManager, subscriptionClientName, retryCount);
        //        });
        //    }
        //    services.AddSingleton<IEventBusSubscriptionsManager, InMemoryEventBusSubscriptionsManager>();
        //    services.AddTransient<AddFileToUserIntegrationEventHandler>();

        //    return services;
        //}
    }
}