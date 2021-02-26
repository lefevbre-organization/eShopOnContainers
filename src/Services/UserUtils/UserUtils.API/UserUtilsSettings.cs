namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API
{
    using BuidingBlocks.Lefebvre.Models;
    using Models;

    public class UserUtilsSettings: BaseSettings
    {
        public string CollectionByPass { get; set; }
        public string DefaultEnvironment { get; set; }

        public string MinihubUrl { get; set; }
        public string OnlineUrl { get; set; }
        public string LoginUrl { get; set; }
        public string ClavesUrl { get; set; }
        public string IdentityUrlExternal { get; set; }
        public string IdentityUrl { get; set; }


        public short IdAppUserUtils { get; set; }
        public short IdAppLexon { get; set; }
        public short IdAppCentinela { get; set; }
        public short IdAppSignaturit { get; set; }
        public long TokenCaducity { get; set; }

        public string TokenKey { get; set; }
        public string OnlineLogin { get; set; }
        public string OnlinePassword { get; set; }

        public string CentinelaApiUrl { get; set; }
        public string LexonApiUrl { get; set; }
        public string SignaturitApiUrl { get; set; }

        public ByPassModel[] ByPassUrls { get; set; }
    }
}