using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using Models;

    public interface IGoogleDriveService
    {
        Task<Result<string>> GetToken(string LefebvreCredential);
        Task<Result<List<File>>> GetFiles(string LefebvreCredential);
        Task<Result<DriveCredential>> GetCredential(string LefebvreCredential);
        Task<Result<List<File>>> SearchFile(string LefebvreCredential, string Searcher);
        Task<Result<bool>> Delete(string LefebvreCredential, string FileId);
        Task<Result<bool>> Trash(string LefebvreCredential);
    }
}