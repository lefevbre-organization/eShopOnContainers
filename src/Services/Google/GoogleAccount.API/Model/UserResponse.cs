using System;
using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class UserResponse
    {
        public string Id { get; set; }
        public string LefebvreCredential { get; set; }
        public List<UserCredentialResponse> Credentials { get; set; }

    }
}