// Models/Domain/Procurement.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UkrainianTraiding.API.Models.Domain // Переконайся, що простір імен відповідає
{
    public class Procurement
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(255)] // Обмеження на довжину назви
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)] // Обмеження на довжину опису
        public string? Description { get; set; } // Може бути необов'язковим

        [Required] // Категорія обов'язкова
        [StringLength(100)] // Довжина категорії
        public string Category { get; set; } = string.Empty;

        // Кількість/Обсяг
        // Використовуй int або double залежно від типу даних
        public double QuantityOrVolume { get; set; } // Приклад: double

        // Орієнтовний бюджет
        // Використовуй decimal або double для грошових значень
        [Column(TypeName = "decimal(18, 2)")] // Вказуємо тип у базі даних
        public decimal EstimatedBudget { get; set; }

        // Дата завершення закупівлі
        public DateTime CompletionDate { get; set; } // Можливо, Optional якщо дата не завжди потрібна

        // Поле для зберігання шляхів до завантажених документів
        // Можна зберігати один шлях або JSON масив шляхів, якщо документів декілька
        public string? DocumentPaths { get; set; } // Приклад: зберігаємо шлях до одного файлу або JSON "[path1, path2]"

        // Зв'язок з користувачем, який створив закупівлю
        [Required]
        public Guid UserId { get; set; } // Foreign Key до таблиці Users

        [ForeignKey("UserId")]
        public User User { get; set; } = null!; // Навігаційна властивість до користувача

        // Дата створення закупівлі (опціонально)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}