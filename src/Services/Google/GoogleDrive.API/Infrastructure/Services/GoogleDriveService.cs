using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    using Exceptions;
    using Model;
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http.Headers;

    public class GoogleDriveService : BaseClass<GoogleDriveService>, IGoogleDriveService
    {
        private readonly IEventBus _eventBus;
        //private readonly IHttpClientFactory _clientFactory;
        //private readonly HttpClient _clientUserUtils;
        private readonly IOptions<GoogleDriveSettings> _settings;

        public GoogleDriveService(
                IOptions<GoogleDriveSettings> settings
                , IEventBus eventBus
                //, IHttpClientFactory clientFactory
                , ILogger<GoogleDriveService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            //_clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            //_clientUserUtils = _clientFactory.CreateClient();
            //_clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            //_clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        public async Task<Result<string>> GetToken(string LefebvreCredential)
        {
            Result<string> result = new Result<string>();
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var resultgettoken = await client.GetAsync($"{_settings.Value.UrlToken}/Credential/GetToken?LefebvreCredential={LefebvreCredential}&Product=0");

                    if (resultgettoken.IsSuccessStatusCode)
                    {
                        result = JsonConvert.DeserializeObject<Result<string>>(await resultgettoken.Content.ReadAsStringAsync());
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new GoogleDriveDomainException($"Error when call Google Account API -> {(int)resultgettoken.StatusCode} - {resultgettoken.ReasonPhrase}"),
                                   Codes.GoogleDrive.GetToken,
                                   Codes.Areas.InternalApi);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException($"Error when call Google Account API", ex), Codes.GoogleDrive.GetToken, Codes.Areas.InternalApi);
            }
            return result;
        }

        private async Task<Result<List<File>>> GetRoot(Root root, string LefebvreCredential)
        {
            List<File> files = new List<File>();
            Result<List<File>> filesResult = new Result<List<File>>(new List<File>());
            //TODO: ABner revisa por favor este método, que te lo he cambiado a result<> y no se si puede haberse roto

            try
            {
                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, filesResult);
                    return filesResult;
                }

                if (!string.IsNullOrEmpty(root.nextPageToken))
                {
                    using (HttpClient client = new HttpClient())
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                        var getroot = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/files?pageToken={root.nextPageToken}&fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fkind%2Cfiles%2Fid%2Cfiles%2Fname%2Cfiles%2Fstarred%2Cfiles%2Ftrashed%2Cfiles%2FmimeType%2Cfiles%2FwebViewLink%2Cfiles%2FiconLink%2Cfiles%2FhasThumbnail%2Cfiles%2FthumbnailLink%2Cfiles%2Fparents");

                        if (getroot.IsSuccessStatusCode)
                        {
                            var _root = JsonConvert.DeserializeObject<Root>(await getroot.Content.ReadAsStringAsync());
                            var _files = await GetRoot(_root, LefebvreCredential);
                            files.AddRange(_files.data);
                        }
                        filesResult.data = files;
                    }
                }
                else
                {
                    filesResult.data = root.files;
                }
            }
            catch (Exception ex)
            {
                TraceError(filesResult.errors, new GoogleDriveDomainException($"Error when call Google Drive API in GetRoot operation", ex), Codes.GoogleDrive.GetRoot, Codes.Areas.InternalApi);
            }
            return filesResult;
        }

        //private async Task<List<File>> GetRoot(Root root, string LefebvreCredential)
        //{
        //    List<File> files = new List<File>();

        //    if (!string.IsNullOrEmpty(root.nextPageToken))
        //    {
        //        var token = await GetToken(LefebvreCredential);

        //        using (HttpClient client = new HttpClient())
        //        {
        //            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.data);
        //            var getroot = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/files?pageToken={root.nextPageToken}&fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fkind%2Cfiles%2Fid%2Cfiles%2Fname%2Cfiles%2Fstarred%2Cfiles%2Ftrashed%2Cfiles%2FmimeType%2Cfiles%2FwebViewLink%2Cfiles%2FiconLink%2Cfiles%2FhasThumbnail%2Cfiles%2FthumbnailLink%2Cfiles%2Fparents");

        //            if (getroot.IsSuccessStatusCode)
        //            {
        //                var _root = JsonConvert.DeserializeObject<Root>(await getroot.Content.ReadAsStringAsync());
        //                var _files = await GetRoot(_root, LefebvreCredential);
        //                files.AddRange(_files);
        //            }
        //            return files;
        //        }
        //    }
        //    else
        //    {
        //        return root.files;
        //    }
        //}


        public async Task<Result<List<File>>> GetFiles(string LefebvreCredential)
        {
            Result<List<File>> result = new Result<List<File>>();

            try
            {
                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, result);
                    return result;
                }
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                    var getroot = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/files?fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fkind%2Cfiles%2Fid%2Cfiles%2Fname%2Cfiles%2Fstarred%2Cfiles%2Ftrashed%2Cfiles%2FmimeType%2Cfiles%2FwebViewLink%2Cfiles%2FiconLink%2Cfiles%2FhasThumbnail%2Cfiles%2FthumbnailLink%2Cfiles%2Fparents");

                    if (getroot.IsSuccessStatusCode)
                    {
                        var _root = JsonConvert.DeserializeObject<Root>(await getroot.Content.ReadAsStringAsync());
                        var _files = await GetRoot(_root, LefebvreCredential);
                        AddResultTrace(_files, result);
                        result.data = _files.data;
                     }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada a la api fallo"), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<DriveCredential>> GetCredential(string LefebvreCredential)
        {
            Result<DriveCredential> result = new Result<DriveCredential>();

            try
            {
                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, result);
                    return result;
                }
                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                    var get = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/about?fields=kind%2Cuser%2F*%2CstorageQuota%2F*");

                    if (get.IsSuccessStatusCode)
                    {
                        result.data = JsonConvert.DeserializeObject<DriveCredential>(await get.Content.ReadAsStringAsync());
                        return result;
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada a la api fallo"), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error in GetCredential", ex), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
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
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error in Search File", ex), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<bool>> Delete(string LefebvreCredential, string FileId)
        {
            Result<bool> result = new Result<bool>(false);

            try
            {
                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, result);
                    return result;
                }

                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                    var get = await client.DeleteAsync($"{_settings.Value.GoogleDriveApi}/files/{FileId}");
                    if (get.IsSuccessStatusCode)
                    {
                        result.data = true;
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.Delete, Codes.Areas.Google);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<bool>> Trash(string LefebvreCredential)
        {
            Result<bool> result = new Result<bool>(false);
            try
            {
                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, result);
                    return result;
                }

                using (HttpClient client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                    var get = await client.DeleteAsync($"{_settings.Value.GoogleDriveApi}/files/trash?enforceSingleParent=true");

                    if (get.IsSuccessStatusCode)
                    {
                        result.data = true;
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.Trash, Codes.Areas.Google);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
            }

            return result;
        }
    }
}