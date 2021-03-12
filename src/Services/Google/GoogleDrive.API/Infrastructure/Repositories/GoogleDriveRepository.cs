﻿using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using BuidingBlocks.Lefebvre.Models;

    public class GoogleDriveRepository : BaseClass<GoogleDriveRepository>, IGoogleDriveRepository
    {
        private readonly GoogleDriveContext _context;
        private readonly IOptions<GoogleDriveSettings> _settings;
        private readonly IEventBus _eventBus;

        public GoogleDriveRepository(
              IOptions<GoogleDriveSettings> settings
            , IEventBus eventBus
            , ILogger<GoogleDriveRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleDriveContext(settings, eventBus);
        }

        public async Task<Result<string>> GetToken(string LefebvreCredential)
        {
            Result<string> result = new Result<string>();

            using (HttpClient client = new HttpClient())
            {
                var resultgettoken = await client.GetAsync($"{_settings.Value.UrlToken}/api/v1/Credential/GetToken?LefebvreCredential={LefebvreCredential}&Product=0");

                if (resultgettoken.IsSuccessStatusCode)
                {
                    result = JsonConvert.DeserializeObject<Result<string>>(await resultgettoken.Content.ReadAsStringAsync());
                }
                else
                {
                }
            }

            return result;
        }

        public async Task GetTreeFiles(string LefebvreCredential)
        {
            await Task.Delay(1);
        }
    }
}