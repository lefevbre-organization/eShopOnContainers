using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    using System.Collections.Generic;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Model;

    public interface IGoogleDriveService
    {
        Task<Result<string>> GetToken(string LefebvreCredential);
        Task<Result<List<GoogleDriveFile>>> GetFiles(string LefebvreCredential);
        Task<Result<DriveCredential>> GetCredential(string LefebvreCredential);
        Task<Result<List<GoogleDriveFile>>> SearchFile(string LefebvreCredential, string Searcher);
        Task<Result<bool>> Delete(string LefebvreCredential, string FileId);
        Task<Result<bool>> Trash(string LefebvreCredential);
        Task<Result<GoogleDriveResonse>> CreateFolder(string LefebvreCredential, string folderName, string parentId);
        Task<Result<GoogleDriveResonse>> UploadFile(string LefebvreCredential, IFormFile formFile, string parentId);
        Task<Result<DownloadedFile>> DownloadFile(string LefebvreCredential, string fileId);


    }
}