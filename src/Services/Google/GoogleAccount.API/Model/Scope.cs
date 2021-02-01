using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class Scope
    {
        public Guid Id { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }
        public GoogleProduct Product { get; set; }
    }
}