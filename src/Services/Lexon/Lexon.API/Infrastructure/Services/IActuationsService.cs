﻿using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IActuationsService
    {
        Task<Result<PaginatedItemsViewModel<LexActuationType>>> GetActuationTypesAsync(string env, string idUser, string bbdd);
        Task<Result<PaginatedItemsViewModel<LexActuationCategory>>> GetActuationCategoriesAsync(string env, string idUser, string bbdd);
        Task<Result<int>> UpsertAppointmentAsync(LexAppointment appointment,
                                              string env,
                                              string idUser,
                                              string bbdd);
        Task<Result<int>> RemoveAppointmentAsync(int idAppointment,
                                                 string env,
                                                 string idUser,
                                                 string bbdd);
        Task<Result<int>> AddAppointmentActionAsync(int idAppointment,
                                                    int idAction,
                                                    string env,
                                                    string idUser,
                                                    string bbdd);
        Task<Result<PaginatedItemsViewModel<LexActuation>>> GetActuationsAsync(string idType,
                                                                               int? idCategory,
                                                                               string idUser,
                                                                               string env,
                                                                               string bbdd,
                                                                               string filter,
                                                                               int pageSize,
                                                                               int pageIndex);
        Task<Result<PaginatedItemsViewModel<LexActuation>>> GetRelationsOfAppointmentAsync(string idEvent,
                                                                                                   string idUser,
                                                                                                   string env,
                                                                                                   string bbdd,
                                                                                                   int pageSize,
                                                                                                   int pageIndex);
        Task<Result<int>> AddActionAsync(
            LexAction action,
            string env,
            string idUser,
            string bbdd);

        Task<Result<int>> RemoveAppointmentActionAsync(int idRelation,
                                                       string env,
                                                       string idUser,
                                                       string bbdd);
    }
}