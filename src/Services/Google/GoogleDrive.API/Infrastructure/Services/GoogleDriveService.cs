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
                        if (getroot != null)
                        {
                            var resultMessage = getroot.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new GoogleDriveFile()
                            {
                                error = errorMessage
                            };
                            result.data = new List<GoogleDriveFile>() { response };

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.GetFiles, Codes.Areas.Google);
                        }
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
                        if (get != null)
                        {
                            var resultMessage = get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new DriveCredential()
                            {
                                error = errorMessage
                            };
                            result.data = response ;

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.GetCredential, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.GetCredential, Codes.Areas.Google);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error in GetCredential", ex), Codes.GoogleDrive.GetCredential, Codes.Areas.Google);
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
                        if (get != null)
                        {
                            var resultMessage = get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new GoogleDriveResonse()
                            {
                                error = errorMessage
                            };
                            result.data = response;

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.CreateFolder, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.CreateFolder, Codes.Areas.Google);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.CreateFolder, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<GoogleDriveResonse>> UploadFile(string LefebvreCredential, IFormFile formFile, string parentId, string sessionId)
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

                        if (string.IsNullOrEmpty(sessionId))
                        {
                            uri = $"{_settings.Value.GoogleDriveApiUpload}?uploadType=resumable";
                            client.DefaultRequestHeaders.TryAddWithoutValidation("X-Upload-Content-Type", formFile.ContentType);
                            client.DefaultRequestHeaders.TryAddWithoutValidation("X-Upload-Content-Length", multiPartFormDataContent.Headers.ContentLength.ToString());
                            //client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Length", formFile.Length.ToString());
                            GoogleDriveBiggerFile request = new GoogleDriveBiggerFile();
                            request.name = formFile.FileName;

                            get = await client.PostAsync(uri, new StringContent("{'name':'" + formFile.FileName + (!string.IsNullOrEmpty(parentId) ? "', 'parents': ['" + parentId + "']" : "'") + "}", Encoding.UTF8, "application/json"));

                        }

                    }


                    if (get.IsSuccessStatusCode || string.IsNullOrEmpty(sessionId))
                    {


                        if ((formFile.Length / 1024) <= 5000)
                        {
                            var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await get.Content.ReadAsStringAsync());
                            TraceInfo(result.infos, "nuevo archivo subido exitosamente");
                            result.data = responseMessage;
                        }
                        else
                        {
                            string newUri = string.IsNullOrEmpty(sessionId) ? get.Headers.Location.AbsoluteUri : sessionId;
                           

                            using (HttpClient client2 = new HttpClient())

                            {
                                client2.Timeout = TimeSpan.FromMinutes(30);
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
                                if (resumable.StatusCode.ToString().Equals("503"))
                                {
                                    var responseMessageError = new GoogleDriveResonse
                                    {
                                        sessionId = newUri,
                                        message = "Hubo un error al intentar subir el archivo. Por favor intente nuevamente enviando como parametro el sessionId generado"
                                    };
                                    result.data = responseMessageError;
                                    
                                }else
                                if (resumable.StatusCode.ToString().Equals("308"))
                                {
                                    var responseMessageError = new GoogleDriveResonse
                                    {
                                        sessionId = "",
                                        message = "Hubo un error al intentar subir el archivo. Por favor intente nuevamente"
                                    };
                                    result.data = responseMessageError;
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
                        if (get != null)
                        {
                            var resultMessage = get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new GoogleDriveResonse()
                            {
                                error = errorMessage
                            };
                            result.data = response;

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.UploadFile, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.UploadFile, Codes.Areas.Google);
                        }
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
                        if (get != null)
                        {
                            var resultMessage = get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new DownloadedFile()
                            {
                                error = errorMessage
                            };
                            result.data = response;

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.DownloadFile, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.DownloadFile, Codes.Areas.Google);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.DownloadFile, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<GoogleDriveResonse>> MoveElement(string LefebvreCredential, string elementId, string parentId, string destinationId)
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

                    var get = await client.PatchAsync($"{_settings.Value.GoogleDriveApi}/files/{elementId}?{(!string.IsNullOrEmpty(parentId) ? "removeParents=" + parentId : "addParents=" + destinationId)}", null);


                   
                    if (get.IsSuccessStatusCode)
                    {
                        var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await get.Content.ReadAsStringAsync());
                        TraceInfo(result.infos, "elemento movido exitosamente");
                        result.data = responseMessage;
                    }
                    else
                    {
                        if (get != null)
                        {
                            var resultMessage = get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new GoogleDriveResonse()
                            {
                                error = errorMessage
                            };
                            result.data = response;

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.MoveElement, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.MoveElement, Codes.Areas.Google);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.MoveElement, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<GoogleDriveResonse>> RenameElement(string LefebvreCredential, string elementId, string currentName, string newName)
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

                if (currentName.Contains("."))
                {
                    if (!newName.Contains("."))
                    {
                        newName += "."+ currentName.Split(".")[1];
                    }
                }

                using (HttpClient client = new HttpClient())

                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var get = await client.PatchAsync($"{_settings.Value.GoogleDriveApi}/files/{elementId}", new StringContent("{'name':'"+ newName+ "'}", Encoding.UTF8, "application/json"));



                    if (get.IsSuccessStatusCode)
                    {
                        var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await get.Content.ReadAsStringAsync());
                        TraceInfo(result.infos, "elemento editado exitosamente");
                        result.data = responseMessage;
                    }
                    else
                    {
                        if (get != null)
                        {
                            var resultMessage = get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new GoogleDriveResonse()
                            {
                                error = errorMessage
                            };
                            result.data = response;

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.RenameElement, Codes.Areas.Google);
                        }
                        else
                        {

                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.RenameElement, Codes.Areas.Google);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.RenameElement, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<GoogleDriveResonse>> GetFile(string LefebvreCredential, string elementId)
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

                    var get = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/files/{elementId}");

                    if (get.IsSuccessStatusCode)
                    {
                        var responseMessage = JsonConvert.DeserializeObject<GoogleDriveResonse>(await get.Content.ReadAsStringAsync());
                        TraceInfo(result.infos, "elemento encontrado exitosamente");
                        result.data = responseMessage;
                    }
                    else
                    {
                        if(get != null)
                        {
                            var resultMessage =  get.Content.ReadAsStringAsync().Result;
                            var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                            var response = new GoogleDriveResonse()
                            {
                                error = errorMessage
                            };
                            result.data = response;
                            
                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.GetFile, Codes.Areas.Google);
                        }
                        else
                        {
                            
                            TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.GetFile, Codes.Areas.Google);
                        }
                       
                    }
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.RenameElement, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<GoogleDriveExportMimeTypes>> GetAvailableExportTypes(string LefebvreCredential, string elementId)
        {
            Result<GoogleDriveExportMimeTypes> result = new Result<GoogleDriveExportMimeTypes>();

            try
            {

                string[] driveMimeTypes = new string[] { "application/vnd.google-apps.document", "application/vnd.google-apps.spreadsheet", "application/vnd.google-apps.drawing", "application/vnd.google-apps.presentation" , "application/vnd.google-apps.script" };

                var resultToken = await GetToken(LefebvreCredential);
                if (resultToken.errors?.Count > 0 || resultToken.data == null)
                {
                    AddResultTrace(resultToken, result);
                    return result;
                }

                var fileInfo = await GetFile(LefebvreCredential, elementId);

                if (fileInfo.data.error == null) {
                    var mimeTypeAllowed = driveMimeTypes.FirstOrDefault(x => fileInfo.data.mimeType == x);
                    if (!string.IsNullOrEmpty(mimeTypeAllowed))
                    {
                        GoogleDriveExportMimeTypes response = new GoogleDriveExportMimeTypes();
                        response.mimeTypes = new List<string>();
                        switch (mimeTypeAllowed)
                        {
                            case "application/vnd.google-apps.document":
                                response.mimeTypes.Add("text/html");
                                response.mimeTypes.Add("application/zip");
                                response.mimeTypes.Add("text/plain");
                                response.mimeTypes.Add("application/rtf");
                                response.mimeTypes.Add("application/vnd.oasis.opendocument.text");
                                response.mimeTypes.Add("application/pdf");
                                response.mimeTypes.Add("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                                response.mimeTypes.Add("application/epub+zip");
                                break;
                            case "application/vnd.google-apps.spreadsheet":
                                response.mimeTypes.Add("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                                response.mimeTypes.Add("application/x-vnd.oasis.opendocument.spreadsheet");
                                response.mimeTypes.Add("application/pdf");
                                response.mimeTypes.Add("text/csv");
                                response.mimeTypes.Add("text/tab-separated-values");
                                break;
                            case "application/vnd.google-apps.drawing":
                                response.mimeTypes.Add("image/jpeg");
                                response.mimeTypes.Add("image/png");
                                response.mimeTypes.Add("image/svg+xml");
                                response.mimeTypes.Add("application/pdf");
                                break;
                            case "application/vnd.google-apps.presentation":
                                response.mimeTypes.Add("application/vnd.openxmlformats-officedocument.presentationml.presentation");
                                response.mimeTypes.Add("application/vnd.oasis.opendocument.presentation");
                                response.mimeTypes.Add("application/pdf");
                                response.mimeTypes.Add("text/plain");
                                break;
                            case "application/vnd.google-apps.script":
                                response.mimeTypes.Add("application/vnd.google-apps.script+json");
                                break;
                        }
                       
                        TraceInfo(result.infos, "formatos encontrados exitosamente");
                        result.data = response;
                    }
                    else
                    {
                        TraceError(result.errors, new GoogleDriveDomainException("El mime type del archivo consultado no pertenece a Google Workspace"), Codes.GoogleDrive.ExportMimeType, Codes.Areas.Google);
                    }
                        
                }
                else
                {
                    result.data = new GoogleDriveExportMimeTypes() { error = fileInfo.data.error };
                    result.errors = fileInfo.errors;
                }
                

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleDriveDomainException("Error", ex), Codes.GoogleDrive.ExportMimeType, Codes.Areas.Google);
            }

            return result;
        }

        public async Task<Result<DownloadedFile>> ExportFile(string LefebvreCredential, string fileId, string mimeType)
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

                var fileData = await GetAvailableExportTypes(LefebvreCredential, fileId);

                if(fileData.errors.Count() <= 0)
                {
                    using (HttpClient client = new HttpClient())

                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resultToken.data);
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        var get = await client.GetAsync($"{_settings.Value.GoogleDriveApi}/files/{fileId}/export?mimeType={mimeType}");

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
                            TraceInfo(result.infos, "archivo descargado exitosamente");
                        }
                        else
                        {
                            if (get != null)
                            {
                                var resultMessage = get.Content.ReadAsStringAsync().Result;
                                var errorMessage = JsonConvert.DeserializeObject<GoogleDriveErrorResponse>(resultMessage);
                                var response = new DownloadedFile()
                                {
                                    error = errorMessage
                                };
                                result.data = response;

                                TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.ExportGoogleWorkspace, Codes.Areas.Google);
                            }
                            else
                            {

                                TraceError(result.errors, new GoogleDriveDomainException("La Llamada Google Drive api falló"), Codes.GoogleDrive.ExportGoogleWorkspace, Codes.Areas.Google);
                            }
                        }
                    }
                }
                else
                {
                    TraceError(result.errors, new GoogleDriveDomainException("El archivo solicitado no pertence a Google Workspace por lo que no es posible exportarlo"), Codes.GoogleDrive.DownloadFile, Codes.Areas.Google);
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