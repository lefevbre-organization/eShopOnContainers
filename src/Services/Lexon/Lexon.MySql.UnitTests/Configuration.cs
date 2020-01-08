using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Lexon.MySql.UnitTests
{
    public static class LexonConfiguration
    {
        public static IConfigurationRoot GetIConfigurationRoot(string outputPath)
        {
            return new ConfigurationBuilder()
                .SetBasePath(outputPath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();
        }

        //public static LexonConfiguration GetApplicationConfiguration(string outputPath)
        //{
        //    var configuration = new KavaDocsConfiguration();

        //    var iConfig = GetIConfigurationRoot(outputPath);

        //    iConfig
        //        .GetSection("KavaDocs")
        //        .Bind(configuration);

        //    return configuration;
        //}
    }
}
