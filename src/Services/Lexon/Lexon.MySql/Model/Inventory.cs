using System;
using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public partial class Inventory
    {
        public Inventory()
        {
            Rental = new HashSet<Rental>();
        }

        public int InventoryId { get; set; }
        public short FilmId { get; set; }
        public byte StoreId { get; set; }
        public DateTimeOffset LastUpdate { get; set; }

        public virtual Film Film { get; set; }
        public virtual Store Store { get; set; }
        public virtual ICollection<Rental> Rental { get; set; }
    }
}
