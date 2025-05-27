// Models/Domain/Offer.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UkrainianTraiding.API.Models.Domain
{
    public class Offer
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ProcurementId { get; set; }
        [ForeignKey("ProcurementId")]
        public virtual Procurement Procurement { get; set; } = null!; // Додав virtual для lazy loading (якщо використовується)

        [Required]
        public Guid SupplierUserId { get; set; } // Змінив назву на SupplierUserId для ясності
        [ForeignKey("SupplierUserId")]
        public virtual User SupplierUser { get; set; } = null!; // Додав virtual

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal ProposedPrice { get; set; }

        [StringLength(1000)]
        public string? Message { get; set; }

        public string? OfferDocumentPaths { get; set; }

        public DateTime OfferDate { get; set; } = DateTime.UtcNow;

        public OfferStatus Status { get; set; } = OfferStatus.Submitted;

        // ----- НОВІ ПОЛЯ, ЯКІ МИ ДОДАЄМО -----
        [Required(ErrorMessage = "Контактний телефон постачальника є обов'язковим.")]
        [StringLength(20, ErrorMessage = "Телефон не може перевищувати 20 символів.")]
        public string SupplierContactPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пропонована дата доставки є обов'язковою.")]
        [DataType(DataType.Date)]
        public DateTime ProposedDeliveryDate { get; set; }

        [Required(ErrorMessage = "Повне найменування постачальника є обов'язковим.")]
        [StringLength(255, ErrorMessage = "Повне найменування не може перевищувати 255 символів.")]
        public string SupplierFullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "ЄДРПОУ/РНОКПП є обов'язковим.")]
        [StringLength(10, ErrorMessage = "ЄДРПОУ/РНОКПП має містити 8 або 10 цифр.")] // 8 для ЄДРПОУ, 10 для РНОКПП
        public string PaymentEdrpou { get; set; } = string.Empty;

        [Required(ErrorMessage = "Номер рахунку IBAN є обов'язковим.")]
        [StringLength(34, ErrorMessage = "IBAN не може перевищувати 34 символи.")] // Загальний стандарт IBAN
        public string SupplierIban { get; set; } = string.Empty;

        [Required(ErrorMessage = "Назва банку є обов'язковою.")]
        [StringLength(255, ErrorMessage = "Назва банку не може перевищувати 255 символів.")]
        public string SupplierBankName { get; set; } = string.Empty;

        [StringLength(12, ErrorMessage = "ІПН не може перевищувати 12 символів.")] // ІПН може бути необов'язковим
        public string? PaymentIpn { get; set; }
        // ---------------------------------------------
    }
}

// Enum OfferStatus залишається тут або може бути винесений в окремий файл в папку Enums, якщо така є
 public enum OfferStatus
 {
     Submitted,
     Accepted,
     Rejected
}