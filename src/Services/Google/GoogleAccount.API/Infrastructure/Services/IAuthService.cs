﻿using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public interface IAuthService
    {
        Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "");
    }
}