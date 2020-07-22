﻿using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IUsersService
    {

        Task<Result<LexUser>> GetUserAsync(string idNavisionUser, string env);

        Task<Result<List<LexCompany>>> GetCompaniesFromUserAsync(string idUser, string env);

        Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch);

        Task<Result<LexEntity>> GetEntityById(EntitySearchById entitySearch);

        Task<MySqlCompany> GetEntitiesFoldersAsync(EntitySearchFoldersView entitySearch);
        //Task<MySqlCompany> GetEntitiesDocumentsAsync(EntitySearchDocumentsView entitySearch);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync(string env);

        Task<Result<List<int>>> AddClassificationToListAsync(ClassificationAddView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove);

        Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classificationSearch);

        Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder);
        Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder);
        Task<Result<bool>> FilePostAsync(MailFileView fileMail);
        Task<Result<string>> FileGetAsync(EntitySearchById fileMail);
        Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch);
        Task<Result<LexUserSimple>> GetUserIdAsync(string idNavisionUser);
        Task<Result<List<LexContact>>> GetAllContactsAsync(BaseView search);
        Task<Result<LexUserSimpleCheck>> CheckRelationsMailAsync(string idUser, MailInfo mail);
    }
}