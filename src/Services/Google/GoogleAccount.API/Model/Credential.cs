using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class Credential
    {

        public Guid Id { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public virtual User User { get; set; }
        public GoogleProduct Product { get; set; }
        public string GoogleMailAccount { get; set; }
        public string ClientId { get; set; }
        public string Secret { get; set; }
        public string Code { get; set; }
        public DateTime? TokenCreate { get; set; }
        public int Duration { get; set; } = 0;
        public bool TokenExpire 
        { 
            get
            {
                if(TokenCreate == null)
                    return true;

                if(Duration == 0)
                    return true;

                var expire = TokenCreate?.AddSeconds(Duration);

                if(DateTime.Now <= expire)
                    return true;
                else    
                    return false;
            }
        }
        public string Scope { get; set; }
        public string Token_Type { get; set; }

        public string Access_Token { get; set; }
        public string Refresh_Token { get; set; }
        public bool Active { get; set; }
    }
}