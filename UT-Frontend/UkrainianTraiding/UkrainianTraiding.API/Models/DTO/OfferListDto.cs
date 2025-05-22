// Models/DTOs/OfferListDto.cs
// Додай цей файл у папку Models/DTOs
using System;

namespace UkrainianTraiding.Models.DTOs
{
    public class OfferListDto
    {
        public Guid Id { get; set; }
        public Guid ProcurementId { get; set; }
        public string ProcurementName { get; set; } // Назва закупівлі, на яку зроблено пропозицію
        public decimal ProposedPrice { get; set; }
        public string? Message { get; set; }
        public string? OfferDocumentPaths { get; set; }
        public DateTime OfferDate { get; set; }
        public string Status { get; set; } // Статус пропозиції як рядок (Submitted, Accepted, Rejected)
    }
}