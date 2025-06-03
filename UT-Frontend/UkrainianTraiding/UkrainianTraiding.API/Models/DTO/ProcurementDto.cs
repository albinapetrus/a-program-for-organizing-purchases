using System;
using UkrainianTraiding.API.Models.Domain.Enums;
namespace UkrainianTraiding.Models.DTO
{
    public class ProcurementDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public double QuantityOrVolume { get; set; }
        public decimal EstimatedBudget { get; set; } 
        public DateTime CompletionDate { get; set; }
        public string? DocumentPaths { get; set; }
        public DateTime CreatedAt { get; set; } 
        public string Status { get; set; } = string.Empty; 
        public string? CustomerName { get; set; } 

        public string? DeliveryAddress { get; set; }
        public string? ContactPhone { get; set; }

        public Guid UserId { get; set; }

    }
}