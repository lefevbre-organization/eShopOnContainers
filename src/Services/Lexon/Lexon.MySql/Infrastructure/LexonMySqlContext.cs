using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.MySql.Infrastructure
{
    public partial class LexonMySqlContext : DbContext
    {
        public LexonMySqlContext()
        {
        }

        public LexonMySqlContext(DbContextOptions<LexonMySqlContext> options)
            : base(options)
        {
        }

        //public virtual DbSet<JosCompany> JosCompanies { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {

            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        }
    }
}