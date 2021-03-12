using Microsoft.Extensions.DependencyInjection;




namespace OcelotApiGw.Extensions
{

    public static class CustomExtensionsMethods
    {
        public static IServiceCollection AddCustomMVC(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .SetIsOriginAllowed((host) => true)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });


            return services;
        }


    }
}