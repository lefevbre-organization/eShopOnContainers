using System;
using System.ComponentModel.DataAnnotations.Schema;
using GoogleModels.Enumerators;

namespace GoogleModels
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
        public string Access_Token { get; set; }
        public string Refresh_Token { get; set; }
        public bool Active { get; set; }
    }
}