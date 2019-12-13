namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure
{
    using Microsoft.AspNetCore.Builder;
    using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Driver;
    using MongoDB.Driver.GeoJsonObjectModel;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using System;

    public class LexonContextSeed
    {
        private static LexonContext ctx;
        public static async Task SeedAsync(
            IApplicationBuilder applicationBuilder
            , ILoggerFactory loggerFactory
            , IEventBus eventBus
            )
        {
            var config = applicationBuilder
                .ApplicationServices.GetRequiredService<IOptions<LexonSettings>>();

            ctx = new LexonContext(config, eventBus);

            if (!ctx.LexonMasters.AsQueryable().Any())
            {
                await SetMasterData();
            }

            if (!ctx.LexonUsers.AsQueryable().Any())
            {
                await SetUserData();
            }
        }

        static async Task SetUserData()
        {
            //var user = new LexonUser()
            //{
            //    version = 9,
            //    idNavision = "E2222",
            //    Name ="Pepe"

            //};

            //await ctx.LexonUsers.InsertOneAsync(user);
        }

        static LexonEntityType[] MakeListEntities()
        {
            List<LexonEntityType> entities = new List<LexonEntityType>
            {
                new LexonEntityType{ idEntity =1 , name="Expedientes"},
                new LexonEntityType{ idEntity =2 , name="Clientes"},
                new LexonEntityType{ idEntity =3 , name="Contrarios"},
                new LexonEntityType{ idEntity =4 , name="Proveedores"},
                new LexonEntityType{ idEntity =5 , name="Abogados propios"},
                new LexonEntityType{ idEntity =6 , name="Abogados contrarios"},
                new LexonEntityType{ idEntity =7 , name="Procuradores propios"},
                new LexonEntityType{ idEntity =8 , name="Procuradores contrarios"},
                new LexonEntityType{ idEntity =9 , name="Notarios"},
                new LexonEntityType{ idEntity =10 , name="Juzgados"},
                new LexonEntityType{ idEntity =11 , name="Aseguradoras"},
                new LexonEntityType{ idEntity =12 , name="Otros"},
                new LexonEntityType{ idEntity =13 , name="Carpetas"},
                new LexonEntityType{ idEntity =14 , name="Documentos"}

            };
            return entities.ToArray();
        }
        static async Task SetMasterData()
        {
            var master = new LexonMaster()
            {
                version = 9,
                type = "Entities",
                timeStamp = 1569837286,
                list = MakeListEntities()
            };

            await ctx.LexonMasters.InsertOneAsync(master);
        }


    }
}
