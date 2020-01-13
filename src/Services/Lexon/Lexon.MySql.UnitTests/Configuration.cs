using Lefebvre.eLefebvreOnContainers.Models;
using System;

namespace Lexon.MySql.UnitTests
{
    public static class Configuration
    {
        public const string FakeIdentityUser = "449";
        public const string FakeBbdd = "lexon_admin_02";
        public const int FakePageIndex = 1;
        public const int FakePageSizeAll = 0;
        public const int FakePageSize = 20;

        internal static Result<JosRelationsList> GetLexonRelationsFake(string fakeIdMail)
        {
            var resultado = new Result<JosRelationsList>(new JosRelationsList());
            resultado.data.Uid = fakeIdMail;
            resultado.data.Actuaciones = new JosActuation[]
            {
                new JosActuation()
            };
            return resultado;
        }

        internal static Result<JosUser> GetLexonUserFake(string fakeIdUserNavision)
        {
            var resultado = new Result<JosUser>(new JosUser() { IdUser = 449, Name = "IVAN Fake" });
            return resultado;
        }

        internal static Result<JosEntityTypeList> GetLexonMasterEntities()
        {
            var resultado = new Result<JosEntityTypeList>(new JosEntityTypeList());
            resultado.data.Entities = new JosEntityType[]
            {
                new JosEntityType(){ IdEntity=1, Name="Expedientes"}
            };
            return resultado;
        }

        internal static Result<JosEntityList> GetLexonEntitiesList()
        {
            var resultado = new Result<JosEntityList>(new JosEntityList());
            resultado.data.Entities = new JosEntity[]
            {
                new JosEntity(){ Code="123123", Description= "desc", IdRelated=12}
            };
            return resultado;
        }

        internal static Result<JosRelationsList> GetRelationsFakeFromMail(string fakeIdMail)
        {
            var resultado = new Result<JosRelationsList>(new JosRelationsList() { Uid=fakeIdMail});
            resultado.data.Actuaciones = new JosActuation[]
                {
                    new JosActuation()
                    {
                         Fecha="2020-12-10 00:00:00.000000",
                        Asunto= "s_12",
                        Nombre= "",
                        Actuacion= 847,
                        IdRelacion= 1,
                        TipoRelacion= 2,
                        Interviniente= "Marina Palermo Calugar mod"
                    },
                     new JosActuation()
                    {
                         Fecha="2020-12-11 00:00:00.000000",
                        Asunto= "s_13",
                        Nombre= "chavalon expedientado",
                        Actuacion= 849,
                        IdRelacion= 1,
                        TipoRelacion= 1,
                        Interviniente= "Marina Kior Jorl"
                    },
                };
            return resultado;
        }
    }
}