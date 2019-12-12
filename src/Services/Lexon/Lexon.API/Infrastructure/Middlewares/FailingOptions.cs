﻿using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Middlewares
{
    public class FailingOptions
    {
        public string ConfigPath = "/Failing";
        public List<string> EndpointPaths { get; set; } = new List<string>();

        public List<string> NotFilteredPaths {get; set;} = new List<string>();
    }
}
