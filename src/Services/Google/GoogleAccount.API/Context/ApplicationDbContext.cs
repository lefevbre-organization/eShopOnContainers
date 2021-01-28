using Google.Models;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context
{
    public class ApplicationDbContext : DbContext
    {
        
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Credential> Credentials { get; set; }

    }
}