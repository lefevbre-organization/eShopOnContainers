﻿using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.API.Model
{
    public class ClassificationAddView : ClassificationView
    {
        public MailInfo[] listaMails { get; set; }
    }

}