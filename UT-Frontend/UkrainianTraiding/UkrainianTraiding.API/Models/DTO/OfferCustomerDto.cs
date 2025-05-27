namespace UkrainianTraiding.API.Models.DTO
{
    public class OfferCustomerDto
    {


        public Guid Id { get; set; }
        public Guid ProcurementId { get; set; }
        public string ProcurementName { get; set; }
        public decimal ProposedPrice { get; set; }
        public string? Message { get; set; }
        public string? OfferDocumentPaths { get; set; }
        public DateTime ProposedDeliveryDate { get; set; }
        public DateTime OfferDate { get; set; }
        public string Status { get; set; } // Статус пропозиції як рядок (Submitted, Accepted, Rejected)
        public string SupplierCompanyName { get; set; }

    }
}
