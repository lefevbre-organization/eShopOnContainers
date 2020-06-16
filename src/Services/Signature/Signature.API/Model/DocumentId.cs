using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class DocumentId
    {
        public string externalId { get; set; }

        public string internalId { get; set; }
    }
}
