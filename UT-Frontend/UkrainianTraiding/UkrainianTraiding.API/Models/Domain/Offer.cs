// Models/Domain/Offer.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UkrainianTraiding.API.Models.Domain // Переконайся, що простір імен відповідає
{
    public class Offer
    {
        [Key]
        public Guid Id { get; set; }

        // Зв'язок із закупівлею, на яку надсилається відгук
        [Required]
        public Guid ProcurementId { get; set; } // Foreign Key до таблиці Procurements

        [ForeignKey("ProcurementId")]
        public Procurement Procurement { get; set; } = null!; // Навігаційна властивість до закупівлі

        // Зв'язок із користувачем (постачальником), який надсилає відгук
        [Required]
        public Guid SupplierUserId { get; set; } // Foreign Key до таблиці Users (саме постачальника)

        [ForeignKey("SupplierUserId")]
        public User SupplierUser { get; set; } = null!; // Навігаційна властивість до користувача-постачальника

        // Деталі пропозиції від постачальника
        [Required]
        [Column(TypeName = "decimal(18, 2)")] // Ціна, запропонована постачальником
        public decimal ProposedPrice { get; set; }

        [StringLength(1000)] // Коментар або повідомлення від постачальника
        public string? Message { get; set; }

        // Поле для зберігання шляхів до документів пропозиції (наприклад, комерційна пропозиція)
        public string? OfferDocumentPaths { get; set; } // Можна зберігати шлях до одного файлу або JSON масив шляхів

        // Дата надсилання пропозиції
        public DateTime OfferDate { get; set; } = DateTime.UtcNow;

        // Статус пропозиції (наприклад, "Надіслано", "Прийнято", "Відхилено")
        // Можна використати Enum для цього
        public OfferStatus Status { get; set; } = OfferStatus.Submitted;
    }
}

// Якщо вирішиш використовувати Enum для статусу
public enum OfferStatus
{
    Submitted,
    Accepted,
    Rejected
}