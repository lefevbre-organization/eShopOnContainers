﻿using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Authentication;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Logging;
using System;

namespace Microsoft.eShopOnContainers.WebMVC.Controllers
{
    //No test --yes test

    [Authorize]
    public class AccountController : Controller
    {
        private readonly ILogger<AccountController> _logger;

        public AccountController(ILogger<AccountController> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [Authorize]
        public async Task<IActionResult> SignIn(string returnUrl)
        {
            var user = User as ClaimsPrincipal;
            var token = await HttpContext.GetTokenAsync("access_token");

            _logger.LogInformation("----- User {@User} authenticated into {AppName}", user, Program.AppName);

            if (token != null)
            {
                ViewData["access_token"] = token;
            }

            // "Catalog" because UrlHelper doesn't support nameof() for controllers
            // https://github.com/aspnet/Mvc/issues/5853
            return RedirectToAction(nameof(CatalogController.Index), "Catalog");
        }

        public async Task<IActionResult> Signout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);

            // "Catalog" because UrlHelper doesn't support nameof() for controllers
            // https://github.com/aspnet/Mvc/issues/5853
            var homeUrl = Url.Action(nameof(CatalogController.Index), "Catalog");
            return new SignOutResult(OpenIdConnectDefaults.AuthenticationScheme,
                new AspNetCore.Authentication.AuthenticationProperties { RedirectUri = homeUrl });
        }
    }
}
