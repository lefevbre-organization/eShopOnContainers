using System;
using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class User
    {

        public User()
        {
            Credentials = new HashSet<Credential>();
        }

        public Guid Id { get; set; }
        public string LefebvreCredential { get; set; }
        public IEnumerable<Credential> Credentials { get; set; }
        
    }
}