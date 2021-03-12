using System;
using System.Collections.Generic;

namespace GoogleModels
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