﻿using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.IO;
using System.Net;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API
{
    public class Program
    {
        public static string Namespace = typeof(Program).Namespace;
        public static string AppName = Namespace.Substring(Namespace.LastIndexOf('.', Namespace.LastIndexOf('.') - 1) + 1);
 
        public static int Main(string[] args)
        {
            var configuration = GetConfiguration();

            Log.Logger = CreateSerilogLogger(configuration);

            try
            {
                Log.Information("Configuring web host ({ApplicationContext})...", Program.AppName);
                var host = CreateHostBuilder(configuration, args);

                //Log.Information("Applying migrations ({ApplicationContext})...", Program.AppName);
                //host.MigrateDbContext<CatalogContext>((context, services) =>
                //{
                //    var env = services.GetService<IWebHostEnvironment>();
                //    var settings = services.GetService<IOptions<LexonSettings>>();
                //    var logger = services.GetService<ILogger<CatalogContextSeed>>();

                //    new CatalogContextSeed()
                //        .SeedAsync(context, env, settings, logger)
                //        .Wait();
                //})
                //.MigrateDbContext<IntegrationEventLogContext>((_, __) => { });

                Log.Information("Starting web host ({ApplicationContext})...", Program.AppName);
                host.Run();

                return 0;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Program terminated unexpectedly ({ApplicationContext})!", Program.AppName);
                return 1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

         static IWebHost CreateHostBuilder(IConfiguration configuration, string[] args) =>
                WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(x => x.AddConfiguration(configuration))
                .CaptureStartupErrors(false)
                .ConfigureKestrel(options =>
                {
                    var ports = GetDefinedPorts(configuration);
                    options.Listen(IPAddress.Any, ports.httpPort, listenOptions =>
                    {
                        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
                    });
                    options.Listen(IPAddress.Any, ports.grpcPort, listenOptions =>
                    {
                        listenOptions.Protocols = HttpProtocols.Http2;
                    });

                })
                .UseStartup<Startup>()
                //.UseApplicationInsights()
                .UseContentRoot(Directory.GetCurrentDirectory())
                //.UseWebRoot("Pics")
                //.UseConfiguration(configuration)
                //.UseSerilog()
                .Build();

        static ILogger CreateSerilogLogger(IConfiguration configuration)
        {
            var seqServerUrl = configuration["Serilog:SeqServerUrl"];
            var logstashUrl = configuration["Serilog:LogstashgUrl"];
            return new LoggerConfiguration()
                .MinimumLevel.Verbose()
                .Enrich.WithProperty("ApplicationContext", Program.AppName)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.Seq(string.IsNullOrWhiteSpace(seqServerUrl) ? "http://seq" : seqServerUrl)
                .WriteTo.Http(string.IsNullOrWhiteSpace(logstashUrl) ? "http://logstash:8080" : logstashUrl)
                .ReadFrom.Configuration(configuration)
                .CreateLogger();
        }

        static (int httpPort, int grpcPort) GetDefinedPorts(IConfiguration config)
        {
            var grpcPort = config.GetValue("GRPC_PORT", 81);
            var port = config.GetValue("PORT", 80);
            return (port, grpcPort);
        }

        static IConfiguration GetConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables();

            //var config = builder.Build();

            //if (config.GetValue<bool>("UseVault", false))
            //{
            //    //is mandatory take values from azurevault
            //    //builder.AddAzureKeyVault(
            //    //    $"https://{config["Vault:Name"]}.vault.azure.net/",
            //    //    config["Vault:ClientId"],
            //    //    config["Vault:ClientSecret"]);
            //}

            return builder.Build();
        }

   }


}