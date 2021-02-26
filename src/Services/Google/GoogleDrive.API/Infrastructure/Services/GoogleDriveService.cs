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
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Model;
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net.Http.Headers;

    using System.Runtime.Serialization;
    using System.Text;

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
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    var resultgettoken = await client.GetAsync($"{_settings.Value.UrlToken}/api/v1/Credential/GetToken?LefebvreCredential={LefebvreCredential}&Product=0");

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

        private async Task<Result<List<GoogleDriveFile>>> GetRoot(Root root, string LefebvreCredential)
        {
            List<GoogleDriveFile> files = new List<GoogleDriveFile>();
            Result<List<GoogleDriveFile>> filesResult = new Result<List<GoogleDriveFile>>(new List<GoogleDriveFile>());
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


        public async Task<Result<List<GoogleDriveFile>>> GetFiles(string LefebvreCredential)
        {
            Result<List<GoogleDriveFile>> result = new Result<List<GoogleDriveFile>>();

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

        public async Task<Result<List<GoogleDriveFile>>> SearchFile(string LefebvreCredential, string Searcher)
        {
            Result<List<GoogleDriveFile>> result = new Result<List<GoogleDriveFile>>();

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

        private MultipartFormDataContent SerializeToMultiPart(string type, string name, string parent, IFormFile formFile)
        {
            // metadata part
            var stringContent = new StringContent("{'name':'" + name + "','mimeType':" + (type.Equals("folder") ? "'application/vnd.google-apps.folder'" : "'" + formFile.ContentType + "'") + (!string.IsNullOrEmpty(parent) ? ", 'parents': ['" + parent + "']" : "") + "}", Encoding.UTF8, "application/json");
            stringContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data");
            stringContent.Headers.ContentDisposition.Name = "\"metadata\"";

            var boundary = DateTime.Now.Ticks.ToString();
            var multiPartFormDataContent = new MultipartFormDataContent(boundary);
            // rfc2387 headers with boundary
            multiPartFormDataContent.Headers.Remove("Content-Type");
            multiPartFormDataContent.Headers.TryAddWithoutValidation("Content-Type", "multipart/related; boundary=" + boundary);
            // request body
            multiPartFormDataContent.Add(stringContent); // metadata part - must be first part in request body

            if (type.Equals("file") && formFile != null)
            {
                var streamContent = new StreamContent(formFile.OpenReadStream());
                streamContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data");
                streamContent.Headers.ContentDisposition.Name = formFile.Name;
                multiPartFormDataContent.Add(streamContent); // media part - must follow metadata part
            }
            return multiPartFormDataContent;

        }

        private MultipartFormDataContent SerializeToMultiPart(IFormFile formFile)
        {
            var boundary = DateTime.Now.Ticks.ToString();
            var multiPartFormDataContent = new MultipartFormDataContent(boundary);
            // rfc2387 headers with boundary
            multiPartFormDataContent.Headers.Remove("Content-Type");
            multiPartFormDataContent.Headers.TryAddWithoutValidation("Content-Type", "multipart/related; boundary=" + boundary);


            var streamContent = new StreamContent(formFile.OpenReadStream());
            streamContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data");
            streamContent.Headers.ContentDisposition.Name = formFile.Name;
            multiPartFormDataContent.Add(streamContent); // media part 

            return multiPartFormDataContent;

        }

        public async Task<Result<GoogleDriveResonse>> CreateFolder(string LefebvreCredential, string folderName, string parentId)
        {
            Result<GoogleDriveResonse> result = new Result<GoogleDriveResonse>();
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
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var multiPartFormDataContent = SerializeToMultiPart("folder", folderName, parentId, null);

                    var get = await client.PostAsync($"{_settings.Value.GoogleDriveApiUpload}?uploadType=multipart", multiPartFormDataContent);

                    if (get.IsSuccessStatusCode)
                    {
                        var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await get.Content.ReadAsStringAsync());
                        TraceInfo(result.infos, "Nuevo fichero creado");
                        result.data = responseMessage;
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.CreateFolder, Codes.Areas.Google);
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.CreateFolder, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<GoogleDriveResonse>> UploadFile(string LefebvreCredential, IFormFile formFile, string parentId)
        {
            Result<GoogleDriveResonse> result = new Result<GoogleDriveResonse>();
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
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));


                    string uri = "";

                    MultipartFormDataContent multiPartFormDataContent;
                    HttpResponseMessage get = new HttpResponseMessage();

                    if ((formFile.Length / 1024) <= 5000)
                    {
                        uri = $"{_settings.Value.GoogleDriveApiUpload}?uploadType=multipart";
                        multiPartFormDataContent = SerializeToMultiPart("file", formFile.FileName, parentId, formFile);
                        get = await client.PostAsync(uri, multiPartFormDataContent);
                    }
                    else
                    {
                        multiPartFormDataContent = SerializeToMultiPart(formFile);
                        uri = $"{_settings.Value.GoogleDriveApiUpload}?uploadType=resumable";
                        client.DefaultRequestHeaders.TryAddWithoutValidation("X-Upload-Content-Type", formFile.ContentType);
                        client.DefaultRequestHeaders.TryAddWithoutValidation("X-Upload-Content-Length", multiPartFormDataContent.Headers.ContentLength.ToString());
                        //client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Length", formFile.Length.ToString());
                        GoogleDriveBiggerFile request = new GoogleDriveBiggerFile();
                        request.name = formFile.FileName;

                        get = await client.PostAsync(uri, new StringContent("{'name':'" + formFile.FileName + (!string.IsNullOrEmpty(parentId) ? "', 'parents': ['" + parentId + "']" : "'") + "}", Encoding.UTF8, "application/json"));


                    }


                    if (get.IsSuccessStatusCode)
                    {


                        if ((formFile.Length / 1024) <= 5000)
                        {
                            var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await get.Content.ReadAsStringAsync());
                            TraceInfo(result.infos, "nuevo archivo subido exitosamente");
                            result.data = responseMessage;
                        }
                        else
                        {
                            string newUri = get.Headers.Location.AbsoluteUri;
                           

                            using (HttpClient client2 = new HttpClient())

                            {
                                client2.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                                client2.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                                client2.DefaultRequestHeaders.TryAddWithoutValidation("Content-Length", multiPartFormDataContent.Headers.ContentLength.ToString());

                                var resumable = await client2.PostAsync(newUri, multiPartFormDataContent);
                                if (resumable.IsSuccessStatusCode)
                                {
                                    var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await resumable.Content.ReadAsStringAsync());
                                    responseMessage.sessionId = newUri;
                                    TraceInfo(result.infos, "nuevo archivo subido exitosamente");
                                    result.data = responseMessage;

                                }
                                else
                                {
                                    TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.UploadFile, Codes.Areas.Google);
                                }
                            }
                              



                        }
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.UploadFile, Codes.Areas.Google);
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.UploadFile, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<DownloadedFile>> DownloadFile(string LefebvreCredential, string fileId)
        {
            Result<DownloadedFile> result = new Result<DownloadedFile>();
            try
            {
                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, result);
                    return result;
                }

                using (HttpClient   client = new HttpClient())
                     
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var get = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/files/fileId?alt=media&fileId={fileId}");

                    if (get.Content != null)
                    {
                        var memory = new MemoryStream();
                        await get.Content.CopyToAsync(memory);
                        var resultMessage = await get.Content.ReadAsStringAsync();

                        DownloadedFile downloadedFile = new DownloadedFile();
                        downloadedFile.mimeType = get.Content.Headers.ContentType.MediaType;
                        downloadedFile.content = Convert.ToBase64String(memory.ToArray());
                        result.data = downloadedFile;

                    }
                    if (get.IsSuccessStatusCode)
                    {
                        TraceInfo(result.infos, "nuevo archivo subido exitosamente");
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.DownloadFile, Codes.Areas.Google);
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.DownloadFile, Codes.Areas.Google);
            }

            return result;
        }

    }
}