// Models/DTO/OfferDetailsDto.cs
namespace UkrainianTraiding.Models.DTO // Або DTOs
{
    public class OfferDetailsDto
    {
        public Guid Id { get; set; }
        public Guid ProcurementId { get; set; }
        public string ProcurementName { get; set; } = string.Empty;
        public Guid SupplierUserId { get; set; }
        public string? SupplierCompanyName { get; set; }

        public decimal ProposedPrice { get; set; }
        public string? Message { get; set; }
        public string? OfferDocumentPaths { get; set; }
        public DateTime OfferDate { get; set; }
        public string Status { get; set; } = string.Empty;

        // --- Повні деталі постачальника та реквізити ---
        public string SupplierContactPhone { get; set; } = string.Empty;
        public string CustomerContactPhone { get; set; } = string.Empty;
        public DateTime ProposedDeliveryDate { get; set; }
        public string SupplierFullName { get; set; } = string.Empty;
        public string PaymentEdrpou { get; set; } = string.Empty;
        public string SupplierIban { get; set; } = string.Empty;
        public string SupplierBankName { get; set; } = string.Empty;
        public string? PaymentIpn { get; set; }
        // -------------------------------------------------
    }
}