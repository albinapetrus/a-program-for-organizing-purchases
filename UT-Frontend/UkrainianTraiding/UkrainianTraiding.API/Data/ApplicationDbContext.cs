using Microsoft.EntityFrameworkCore;
using UkrainianTraiding.API.Models.Domain;

namespace UkrainianTraiding.API.Data
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Procurement> Procurements { get; set; } = null!;
        public DbSet<Offer> Offers { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Offer>()
                .HasOne(o => o.Procurement) 
                .WithMany() 
                .HasForeignKey(o => o.ProcurementId)
                .OnDelete(DeleteBehavior.Cascade); 

            modelBuilder.Entity<Offer>()
                .HasOne(o => o.SupplierUser) 
                .WithMany() 
                .HasForeignKey(o => o.SupplierUserId)
                .OnDelete(DeleteBehavior.NoAction);
        
        }
    }
}
