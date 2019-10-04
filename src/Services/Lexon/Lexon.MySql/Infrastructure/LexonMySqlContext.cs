using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using Lexon.MySql.Model;

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

        public virtual DbSet<JosCompany> JosCompanies { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                //optionsBuilder.UseMySql("server=ES006-PPDDB003;port=3315;user=led-app-api;password=ZSDmdvq2+ca234;database=lexon_pre_01");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<JosCompany>(entity =>
            //{
            //    entity.HasKey(e => e.IdEmpresa)
            //        .HasName("PRIMARY");

            //    entity.ToTable("jos_wg_empresas");

            //    entity.HasIndex(e => e.NavisionId)
            //        .HasName("navision_id_UNIQUE")
            //        .IsUnique();

            //    entity.Property(e => e.IdEmpresa).HasColumnType("int(11)");

            //    entity.Property(e => e.Alias)
            //        .IsRequired()
            //        .HasColumnName("alias")
            //        .HasColumnType("varchar(255)");

            //    entity.Property(e => e.CodigoPostal).HasColumnType("varchar(5)");

            //    entity.Property(e => e.Dbdatabase)
            //        .HasColumnName("DBDatabase")
            //        .HasColumnType("varchar(40)");

            //    entity.Property(e => e.Dbdriver)
            //        .HasColumnName("DBDriver")
            //        .HasColumnType("varchar(20)");

            //    entity.Property(e => e.Dbhost)
            //        .HasColumnName("DBHost")
            //        .HasColumnType("varchar(20)");

            //    entity.Property(e => e.Dbpassword)
            //        .HasColumnName("DBPassword")
            //        .HasColumnType("varchar(20)");

            //    entity.Property(e => e.Dbprefix)
            //        .HasColumnName("DBPrefix")
            //        .HasColumnType("varchar(20)");

            //    entity.Property(e => e.Dbuser)
            //        .HasColumnName("DBUser")
            //        .HasColumnType("varchar(20)");

            //    entity.Property(e => e.Direccion).HasColumnType("varchar(150)");

            //    entity.Property(e => e.Dninif)
            //        .HasColumnName("DNINIF")
            //        .HasColumnType("varchar(10)");

            //    entity.Property(e => e.Email).HasColumnType("varchar(120)");

            //    entity.Property(e => e.Fax).HasColumnType("varchar(15)");

            //    entity.Property(e => e.IdProvincia).HasColumnType("int(11)");

            //    entity.Property(e => e.Movil).HasColumnType("varchar(15)");

            //    entity.Property(e => e.NavisionId)
            //        .HasColumnName("navision_id")
            //        .HasColumnType("int(11)");

            //    entity.Property(e => e.Nombre).HasColumnType("varchar(60)");

            //    entity.Property(e => e.Observaciones).HasColumnType("text");

            //    entity.Property(e => e.Params)
            //        .HasColumnName("params")
            //        .HasColumnType("text");

            //    entity.Property(e => e.Poblacion).HasColumnType("varchar(120)");

            //    entity.Property(e => e.Telefono).HasColumnType("varchar(15)");

            //    entity.Property(e => e.Web).HasColumnType("varchar(120)");
            //});
        }
    }
}
