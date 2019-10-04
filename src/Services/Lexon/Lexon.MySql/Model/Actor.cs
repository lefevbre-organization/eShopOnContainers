using System;
using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public partial class Actor
    {
        public Actor()
        {
            FilmActor = new HashSet<FilmActor>();
        }

        public short ActorId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTimeOffset LastUpdate { get; set; }

        public virtual ICollection<FilmActor> FilmActor { get; set; }
    }
}
