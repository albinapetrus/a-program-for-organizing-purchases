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

            // Налаштування зв'язку між Procurement та User (User створює Procurement)
            // EF Core за замовчуванням може встановити CASCADE, якщо UserId НЕ nullable
            // Якщо хочеш явно встановити CASCADE, можеш додати:
            // modelBuilder.Entity<Procurement>()
            //    .HasOne(p => p.User) // Закупівля має одного користувача
            //    .WithMany() // Користувач має багато закупівель (або WithMany(u => u.Procurements), якщо додасиш Navigation Property)
            //    .HasForeignKey(p => p.UserId)
            //    .OnDelete(DeleteBehavior.Cascade); // Видалення користувача видаляє закупівлі

            // Налаштування зв'язку між Offer та Procurement (Offer належить до Procurement)
            modelBuilder.Entity<Offer>()
                .HasOne(o => o.Procurement) // Пропозиція належить до однієї закупівлі
                .WithMany() // Закупівля може мати багато пропозицій (або WithMany(p => p.Offers))
                .HasForeignKey(o => o.ProcurementId)
                .OnDelete(DeleteBehavior.Cascade); // Видалення закупівлі видаляє пропозиції (це зберігаємо)

            // !!! ВАЖЛИВО: Налаштування зв'язку між Offer та User (Offer від постачальника) !!!
            // Тут ми явно встановлюємо NoAction, щоб уникнути циклічного видалення
            modelBuilder.Entity<Offer>()
                .HasOne(o => o.SupplierUser) // Пропозиція зроблена одним користувачем-постачальником
                .WithMany() // Користувач може зробити багато пропозицій (або WithMany(u => u.Offers))
                .HasForeignKey(o => o.SupplierUserId)
                .OnDelete(DeleteBehavior.NoAction); // !!! ВСТАНОВЛЮЄМО NO ACTION ТУТ !!!
                                                    // Це означає: НЕ видаляти пропозиції, якщо видаляється постачальник.
                                                    // База даних поверне помилку, якщо спробувати видалити постачальника, у якого є пропозиції.

            // Додатково, якщо у тебе є зв'язок User -> User (наприклад, хто створив User),
            // переконайся, що там теж правильно налаштовано OnDelete.
        }
    }
}
