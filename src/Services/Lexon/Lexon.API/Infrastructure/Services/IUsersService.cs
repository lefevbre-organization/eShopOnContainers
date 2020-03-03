﻿using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IUsersService
    {
      //  Task<Result<List<LexonUser>>> GetListUsersAsync(int pageSize, int pageIndex, string idUser);

        Task<Result<LexUser>> GetUserAsync(string idNavisionUser);

        Task<Result<List<LexCompany>>> GetCompaniesFromUserAsync(string idUser);

        Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch);

        Task<Result<LexEntity>> GetEntityById(EntitySearchById entitySearch);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

        Task<Result<long>> AddClassificationToListAsync(ClassificationAddView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove);

        Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classificationSearch);

        Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder);
        Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder);
    }
}