using Microsoft.AspNetCore.Http;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Models
{
    public class UploadFileRequest
    {
        public string name { set;get; }
        public string mimeType { set;get; }
        public IFormFile MyImage { set; get; }
    }
}