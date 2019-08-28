using Autofac;
using Autofac.Extensions.DependencyInjection;
using Lexon.API.Extensions;
using Lexon.API.IntegrationsEvents.EventHandling;
using Lexon.API.IntegrationsEvents.Events;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Lexon.API
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
            services.AddAppInsight(Configuration)
             .AddCustomMVC(Configuration)
             .AddCustomDbContext(Configuration)
             .AddCustomOptions(Configuration)
             .AddIntegrationServices(Configuration)
             .AddEventBus(Configuration)
             .AddSwagger()
             .AddCustomHealthCheck(Configuration);

            var container = new ContainerBuilder();
            container.Populate(services);
            return new AutofacServiceProvider(container.Build());
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            var pathBase = Configuration["PATH_BASE"];

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseSwagger()
              .UseSwaggerUI(c =>
              {
                  c.SwaggerEndpoint($"{ (!string.IsNullOrEmpty(pathBase) ? pathBase : string.Empty) }/swagger/v1/swagger.json", "Lexon.API V1");
                  c.RoutePrefix = @"api";
              });

            app.UseMvc();
            ConfigureEventBus(app);
        }

        private void ConfigureEventBus(IApplicationBuilder app)
        {
            var eventBus = app.ApplicationServices.GetRequiredService<IEventBus>();

            eventBus.Subscribe<AddFileToUserIntegrationEvent, AddFileToUserIntegrationEventHandler>();
        }
    }
}