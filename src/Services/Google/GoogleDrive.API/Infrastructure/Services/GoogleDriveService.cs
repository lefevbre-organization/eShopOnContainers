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
    using System.Linq;
    using System.Net.Http.Headers;
    using Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Exceptions;
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
                var resultgettoken = await client.GetAsync($"{_settings.Value.UrlToken}/api/v1/Credential/GetToken?LefebvreCredential={LefebvreCredential}&Product=0");

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
                    var getroot = await client.GetAsync($"https://www.googleapis.com/drive/v3/files?pageToken={root.nextPageToken}&fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fkind%2Cfiles%2Fid%2Cfiles%2Fname%2Cfiles%2Fstarred%2Cfiles%2Ftrashed%2Cfiles%2FmimeType%2Cfiles%2FwebViewLink%2Cfiles%2FiconLink%2Cfiles%2FhasThumbnail%2Cfiles%2FthumbnailLink%2Cfiles%2Fparents");

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

            try
            {    
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
                    var getroot = await client.GetAsync($"https://www.googleapis.com/drive/v3/files?fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fkind%2Cfiles%2Fid%2Cfiles%2Fname%2Cfiles%2Fstarred%2Cfiles%2Ftrashed%2Cfiles%2FmimeType%2Cfiles%2FwebViewLink%2Cfiles%2FiconLink%2Cfiles%2FhasThumbnail%2Cfiles%2FthumbnailLink%2Cfiles%2Fparents");

                    if(getroot.IsSuccessStatusCode)
                    {
                        var _root = JsonConvert.DeserializeObject<Root>(await getroot.Content.ReadAsStringAsync());
                        var _files = await GetRoot(_root, LefebvreCredential);
                        result.data = _files;
                        return result;
                    }else{
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada a la api fallo"), Codes.GoogleDrive.Get, Codes.Areas.Google);
                    }
                }
            }
            catch (System.Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.Get, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<DriveCredential>> GetCredential(string LefebvreCredential)
        {
            var token = await GetToken(LefebvreCredential);

            Result<DriveCredential> result = new Result<DriveCredential>();

            try
            {
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
                    var get = await client.GetAsync($"https://www.googleapis.com/drive/v3/about?fields=kind%2Cuser%2F*%2CstorageQuota%2F*");

                    if(get.IsSuccessStatusCode)
                    {
                        result.data = JsonConvert.DeserializeObject<DriveCredential>(await get.Content.ReadAsStringAsync());
                        return result;
                    }else{
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada a la api fallo"), Codes.GoogleDrive.Get, Codes.Areas.Google);
                    }
                }
            }
            catch (System.Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.Get, Codes.Areas.Google);
            }

            
            return result;
        }

        public async Task<Result<List<File>>> SearchFile(string LefebvreCredential, string Searcher)
        {

            Result<List<File>> result = new Result<List<File>>();

            try
            {
                var filesresult = await GetFiles(LefebvreCredential);
                var files = filesresult.data;
                var filessearch = files.Where(x => 
                    x.name.ToLower().Contains(Searcher.ToLower())
                    || x.mimeType.ToLower().Contains(Searcher.ToLower())
                ).ToList();
                result.data = filessearch;
            }
            catch (System.Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.Get, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<bool>> Delete(string LefebvreCredential, string FileId)
        {
            var token = await GetToken(LefebvreCredential);

            Result<bool> result = new Result<bool>();
            result.data = false;

            try
            {    
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
                    var get = await client.DeleteAsync($"https://www.googleapis.com/drive/v3/files/{FileId}");
                    if(get.IsSuccessStatusCode)
                    {
                        result.data = true;
                    }
                }
            }
            catch (System.Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.Get, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<bool>> Trash(string LefebvreCredential)
        {
            var token = await GetToken(LefebvreCredential);

            Result<bool> result = new Result<bool>();
            try
            {    
                result.data = false;

                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
                    var get = await client.DeleteAsync($"https://www.googleapis.com/drive/v3/files/trash?enforceSingleParent=true");

                    if(get.IsSuccessStatusCode)
                    {
                        result.data = true;
                    }
                }
            }
            catch (System.Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.Get, Codes.Areas.Google);
            }

            return result;
        }
        
    }
}