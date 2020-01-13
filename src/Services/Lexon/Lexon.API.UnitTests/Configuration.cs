using Lefebvre.eLefebvreOnContainers.Models;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model;
using System.Collections.Generic;

namespace Lexon.API.UnitTests
{
    public static class Configuration
    {
        public const string FakeIdentityUser = "449";
        public const string FakeBbdd = "lexon_admin_02";
        public const int FakePageIndex = 1;
        public const int FakePageSizeAll = 0;
        public const int FakePageSize = 20;

        internal static Result<List<LexonActuation>> GetLexonRelationsFake(string fakeIdMail)
        {
            var resultado = new Result<List<LexonActuation>>(new List<LexonActuation>());

            var listaActuaciones = new List<LexonActuation>
            {
                new LexonActuation() { description = "yuyu", entityIdType = 1, idMail = fakeIdMail, idRelated = 345, name = "cacerolo tex",
                        intervening= "Marina Palermo Calugar mod" },
                new LexonActuation() { description = "yaya", entityIdType = 13, idMail = fakeIdMail, idRelated = 347, name = "cacerolo folder",
                        intervening= "Marx segunda Engels" }
            };

            resultado.data = listaActuaciones;
            return resultado;
        }

        internal static Result<LexonUser> GetLexonUserFake(string fakeIdUserNavision)
        {
            var resultado = new Result<LexonUser>(new LexonUser() { idNavision = fakeIdUserNavision, Id = "449", Name = "IVAN Fake" });
            return resultado;
        }

        internal static Result<List<LexonEntityType>> GetLexonMasterEntities()
        {
            var resultado = new Result<List<LexonEntityType>>(new List<LexonEntityType>());
            var listaMaster = new List<LexonEntityType>()
            {
                new LexonEntityType() { idEntity = 1, name = "File" },
                new LexonEntityType() { idEntity = 13, name = "Folder" },
                new LexonEntityType() { idEntity = 14, name = "Document" }
            };
            resultado.data = listaMaster;
            return resultado;
        }

        internal static Result<List<LexonEntityBase>> GetLexonEntitiesList()
        {
            var resultado = new Result<List<LexonEntityBase>>(new List<LexonEntityBase>());
            var listaEntidades = new List<LexonEntityBase>()
            {
                new LexonEntityBase() { description = "yuyu", idType = 1, name = "cacerolo tex", id = 234 }
            };
            resultado.data = listaEntidades;

            return resultado;
        }

        internal static Result<List<LexonActuation>> GetRelationsFakeFromMail(string fakeIdMail)
        {
            var resultado = new Result<List<LexonActuation>>(new List<LexonActuation>());
            resultado.data = new List<LexonActuation>
                {
                    new LexonActuation()
                    {
                        date="2020-12-10 00:00:00.000000",
                        name= "file_12",
                        description= "descripcion explendida",
                        entityIdType= 1,
                        intervening= "Marina Palermo Calugar mod"
                    },
                    new LexonActuation()
                    {
                        date="2020-12-10 00:00:00.000000",
                        name= "folder_12",
                        description= "descripcion explendida",
                        entityIdType= 13,
                        intervening= "Marina Kior Jorl"
                    }
                };
            return resultado;
        }
    }
}