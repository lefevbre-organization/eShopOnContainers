﻿namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class ClassificationContactsView
    {
        public string[] ContactList { get; set; }

        public MailInfo mail { get; set; }

        public string bbdd { get; set; }
        public string idUser { get; set; }
    }
}