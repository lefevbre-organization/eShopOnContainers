namespace Lefebvre.Shared
{
    public class GoogleTokenRequest
    {
        
        public string token_uri { get; set; } = "https://oauth2.googleapis.com/token";
        public string refresh_token { get; set; }

    }
}