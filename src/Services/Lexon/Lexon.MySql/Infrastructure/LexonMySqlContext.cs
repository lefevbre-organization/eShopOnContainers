//using Lexon.MySql.Model;
//using Microsoft.EntityFrameworkCore;

//namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure
//{
//    public partial class LexonMySqlContext : DbContext
//    {
//        public LexonMySqlContext()
//        {
//        }

//        public LexonMySqlContext(DbContextOptions<LexonMySqlContext> options)
//            : base(options)
//        {
//        }

//        public virtual DbSet<JosCompany> JosCompanies { get; set; }

//        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//        {
//            if (!optionsBuilder.IsConfigured)
//            {
//                //optionsBuilder.UseMySql("server=ES006-PPDDB003;port=3315;user=led-app-api;password=ZSDmdvq2+ca234;database=lexon_pre_01");
//            }
//        }

//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
            
//        }
//    }
//}