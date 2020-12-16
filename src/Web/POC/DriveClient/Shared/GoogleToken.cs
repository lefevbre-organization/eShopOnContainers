using System;

namespace Lefebvre.Shared
{
    public class GoogleToken
    {   
        
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string Token { get; set; }
        public string TokenRefresh { get; set; }
        public bool TokenReadOnly { get; set; }


    }
}