﻿using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Web.Lexon.HttpAggregator.Models
{
    public class UpdateBasketItemsRequest
    {
        public string BasketId { get; set; }

        public ICollection<UpdateBasketItemData> Updates { get; set; }

        public UpdateBasketItemsRequest()
        {
            Updates = new List<UpdateBasketItemData>();
        }
    }

    public class UpdateBasketItemData
    {
        public string BasketItemId { get; set; }
        public int NewQty { get; set; }

        public UpdateBasketItemData()
        {
            NewQty = 0;
        }
    }
}