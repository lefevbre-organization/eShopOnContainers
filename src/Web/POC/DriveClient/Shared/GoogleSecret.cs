using System;

namespace Lefebvre.Shared
{
    public class GoogleSecret
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public bool ClientReadOnly { get; set; }
        public bool SaveKeys { get; set; }

    }
}