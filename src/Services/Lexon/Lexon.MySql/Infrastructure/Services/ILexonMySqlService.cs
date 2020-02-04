using Lexon.MySql.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {
        Task<Result<JosUserCompanies>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idNavisionUser);

        Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync();

        Task<Result<JosEntityList>> GetEntitiesAsync(int pageSize,
            int pageIndex,
            short? idType,
            string bbdd,
            string idUser,
            string search,
            long? idFilter);

        Task<Result<int>> RemoveRelationMailAsync(short idType,
            string bbdd,
            string idUser,
            string provider,
            string mailAccount,
            string uidMail,
            long idRelated);

        Task<Result<int>> AddRelationContactsMailAsync(string bbdd,
                                                        string idUser,
                                                        MailInfo mailInfo,
                                                        string[] contactList);

        Task<Result<int>> AddRelationMailAsync(short idType,
            string bbdd,
            string idUser,
            MailInfo[] listaMails,
            long idRelated);

        Task<Result<JosRelationsList>> GetRelationsAsync(int pageSize,
            int pageIndex,
            short? idType,
            string bbdd,
            string idUser,
            string idMail);

        Task<Result<JosUser>> GetUserAsync(string idUser,
                                           string bbdd = null,
                                           string provider = null,
                                           string mailAccount = null,
                                           string uidMail = null,
                                           string folder = null,
                                           short? idEntityType = null,
                                           int? idEntity = null,
                                           List<string> mailContacts = null,
                                           bool addTerminatorToToken = true);

        Task<Result<JosEntity>> GetEntityAsync(string bbdd, string idUser, short idType, long idEntity);
    }
}