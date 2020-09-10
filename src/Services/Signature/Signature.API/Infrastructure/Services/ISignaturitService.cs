namespace Signature.API.Infrastructure.Services
{
    #region using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    #endregion

    public interface ISignaturitService
    {
        Task<RestSharp.IRestResponse> GetSignatures(string user);

        Task<RestSharp.IRestResponse> CancelSignature(string  signatureId);

        Task<RestSharp.IRestResponse> CreateSignature(CreateSignaturit signatureInfo);

        Task<RestSharp.IRestResponse> DownloadDocument(string signatureId, string documentId);

        Task<RestSharp.IRestResponse> DownloadTrail(string signatureId, string documentId);

        Task<RestSharp.IRestResponse> DownloadAttachments(string signatureId, string documentId);

        Task<RestSharp.IRestResponse> sendReminder(string signatureId);

        Task<RestSharp.IRestResponse> CreateBranding(BrandingConfiguration brandingInfo);

    }
}