using System;
using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public partial class City
    {
        public City()
        {
            Address = new HashSet<Address>();
        }

        public short CityId { get; set; }
        public string City1 { get; set; }
        public short CountryId { get; set; }
        public DateTimeOffset LastUpdate { get; set; }

        public virtual Country Country { get; set; }
        public virtual ICollection<Address> Address { get; set; }
    }
}
