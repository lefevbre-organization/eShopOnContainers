using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.Server.Models
{
    public class ApplicationUser : IdentityUser
    {

        public string SecretId { get; set; }
        public string ClientId { get; set; }
        public string ApiKey { get; set; }
        
    }
}
