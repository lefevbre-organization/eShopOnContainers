using System;
using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public partial class Country
    {
        public Country()
        {
            City = new HashSet<City>();
        }

        public short CountryId { get; set; }
        public string Country1 { get; set; }
        public DateTimeOffset LastUpdate { get; set; }

        public virtual ICollection<City> City { get; set; }
    }
}
