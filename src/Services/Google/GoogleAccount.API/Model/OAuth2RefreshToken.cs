namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class OAuth2RefreshToken
    {
        public string client_id { get; set; }
        public string client_secret { get; set; }
        public string refresh_token { get; set; }
        public string grant_type { get; set; }
    }

    public class OAuth2TokenModel
    {
        public string access_token { get; set; }
        public int expires_in { get; set; }
        public string refresh_token { get; set; }
        public string scope { get; set; }
        public string token_type { get; set; }
    }
}