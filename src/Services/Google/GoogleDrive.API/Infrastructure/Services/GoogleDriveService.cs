using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    using System.Collections.Generic;
    using System.Net.Http.Headers;
    using Model;
    using Newtonsoft.Json;
    using Repositories;

    public class GoogleDriveService : BaseClass<GoogleDriveService>, IGoogleDriveService
    {
        
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<GoogleDriveSettings> _settings;

        public GoogleDriveService(
                IOptions<GoogleDriveSettings> settings
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<GoogleDriveService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            _clientUserUtils = _clientFactory.CreateClient();
            _clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        public async Task<Result<string>> GetToken(string LefebvreCredential)
        {
            Result<string> result = new Result<string>();
            using (HttpClient client = new HttpClient())
            {
                var resultgettoken = await client.GetAsync($"{_settings.Value.UrlToken}/Credential/GetToken?LefebvreCredential={LefebvreCredential}&Product=0");

                if(resultgettoken.IsSuccessStatusCode)
                {
                    result = JsonConvert.DeserializeObject<Result<string>>(await resultgettoken.Content.ReadAsStringAsync());
                }else{

                }
            }
            return result;
        }

        private async Task<List<File>> GetRoot(Root root, string LefebvreCredential)
        {

            List<File> files = new List<File>();

            if(!string.IsNullOrEmpty(root.nextPageToken))
            {
                var token = await GetToken(LefebvreCredential);

                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
                    var getroot = await client.GetAsync($"https://www.googleapis.com/drive/v3/files?pageToken={root.nextPageToken}");

                    if(getroot.IsSuccessStatusCode)
                    {
                        var _root = JsonConvert.DeserializeObject<Root>(await getroot.Content.ReadAsStringAsync());
                        var _files = await GetRoot(_root, LefebvreCredential);
                        files.AddRange(_files);
                    }
                    return files;
                }
            }else{
                return root.files;
            }
        }

        public async Task<Result<List<File>>> GetFiles(string LefebvreCredential)
        {
            
            var token = await GetToken(LefebvreCredential);
            Result<List<File>> result = new Result<List<File>>();

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
                var getroot = await client.GetAsync($"https://www.googleapis.com/drive/v3/files");

                if(getroot.IsSuccessStatusCode)
                {
                    var _root = JsonConvert.DeserializeObject<Root>(await getroot.Content.ReadAsStringAsync());
                    var _files = await GetRoot(_root, LefebvreCredential);
                    result.data = _files;
                    return result;
                }
            }

            return result;
        }

        
    }
}