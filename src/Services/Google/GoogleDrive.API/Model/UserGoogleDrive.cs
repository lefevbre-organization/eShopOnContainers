﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Models
{
    public class UserGoogleDrive 
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string idNavision { get; set; }
        public short idApp { get; set; }


    }
}