// Models/Domain/Procurement.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UkrainianTraiding.API.Models.Domain.Enums; // Переконайся, що це правильний шлях до твого enum

namespace UkrainianTraiding.API.Models.Domain // Переконайся, що простір імен відповідає
{
    public class Procurement
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Назва закупівлі є обов'язковою.")]
        [StringLength(255, ErrorMessage = "Назва закупівлі не може перевищувати 255 символів.")]
        public string Name { get; set; } = string.Empty; // Ініціалізація, щоб уникнути попередження non-nullable

        [StringLength(1000, ErrorMessage = "Опис закупівлі не може перевищувати 1000 символів.")]
        public string? Description { get; set; } // Nullable, попередження немає

        [Required(ErrorMessage = "Категорія є обов'язковою.")]
        [StringLength(100, ErrorMessage = "Категорія не може перевищувати 100 символів.")]
        public string Category { get; set; } = string.Empty; // Ініціалізація

        // Кількість/Обсяг - тип double, як ти використовуєш при парсингу
        public double QuantityOrVolume { get; set; } // Типи значень (double, decimal, int, DateTime) не викликають попередження non-nullable,
                                                     // оскільки вони завжди мають значення за замовчуванням (0, 0.0, DateTime.MinValue і т.д.)

        // Орієнтовний бюджет - тип decimal
        [Column(TypeName = "decimal(18, 2)")]
        public decimal EstimatedBudget { get; set; }

        // Дата завершення закупівлі
        public DateTime CompletionDate { get; set; }

        // Поле для зберігання шляхів до завантажених документів
        public string? DocumentPaths { get; set; } // Nullable

        // Зв'язок з користувачем, який створив закупівлю
        [Required]
        public Guid UserId { get; set; } // Foreign Key до таблиці Users (або ApplicationUser)

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!; // `null!` приглушує попередження компілятора для non-nullable навігаційних властивостей,
                                                        // які будуть завантажені Entity Framework. Додано `virtual` для lazy loading (якщо використовується).

        // Дата створення закупівлі
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Ініціалізація

        // Статус закупівлі
        public ProcurementStatus Status { get; set; } = ProcurementStatus.Open; // Ініціалізація значенням за замовчуванням

        // ----- НОВІ ПОЛЯ, ЩО ДОДАЮТЬСЯ ЗАРАЗ -----
        [StringLength(500, ErrorMessage = "Адреса доставки не може перевищувати 500 символів.")]
        public string? DeliveryAddress { get; set; } // Робимо nullable, оскільки на фронтенді не обов'язкове

        [StringLength(20, ErrorMessage = "Контактний номер телефону не може перевищувати 20 символів.")]
        public string? ContactPhone { get; set; }    // Робимо nullable
        // ---------------------------------------------
    }
}