// Models/DTOs/OfferListDto.cs
using System;

namespace UkrainianTraiding.Models.DTOs // Зверни увагу на простір імен DTOs (з 's' в кінці)
{
    public class OfferListDto // Можна залишити цю назву, або перейменувати на OfferDto, якщо він буде універсальним
    {
        public Guid Id { get; set; }
        public Guid ProcurementId { get; set; }
        public string ProcurementName { get; set; } = string.Empty; // Назва закупівлі
        public Guid SupplierUserId { get; set; } // Додав ID постачальника
        public string? SupplierCompanyName { get; set; } // Додав назву компанії постачальника

        public decimal ProposedPrice { get; set; }
        public string? Message { get; set; }
        public string? OfferDocumentPaths { get; set; }
        public DateTime OfferDate { get; set; }
        public string Status { get; set; } = string.Empty; // Статус пропозиції

        // ----- НОВІ ПОЛЯ, ЯКІ МИ ДОДАЄМО ДЛЯ ПОВНИХ ДЕТАЛЕЙ -----
        public string SupplierContactPhone { get; set; } = string.Empty;
        public DateTime ProposedDeliveryDate { get; set; }
        public string SupplierFullName { get; set; } = string.Empty; // Повне найменування ФОП/ТОВ
        public string PaymentEdrpou { get; set; } = string.Empty;    // ЄДРПОУ/РНОКПП
        public string SupplierIban { get; set; } = string.Empty;     // IBAN
        public string SupplierBankName { get; set; } = string.Empty; // Назва банку
        public string? PaymentIpn { get; set; }                       // ІПН (якщо є)
        // ---------------------------------------------------------
    }
}