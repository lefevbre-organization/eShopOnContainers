using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lexon.API
{

    public class EventBusSettings
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public string VirtualHost { get; set; }

        public string HostName { get; set; }

        public string Uri { get; set; }
        public int Port { get; set; }

        public int RetryCount { get; set; }
    }
}
