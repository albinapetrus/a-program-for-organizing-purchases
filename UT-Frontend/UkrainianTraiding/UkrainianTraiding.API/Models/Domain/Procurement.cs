// Models/Domain/Procurement.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UkrainianTraiding.API.Models.Domain.Enums; 

namespace UkrainianTraiding.API.Models.Domain 
{
    public class Procurement
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Назва закупівлі є обов'язковою.")]
        [StringLength(255, ErrorMessage = "Назва закупівлі не може перевищувати 255 символів.")]
        public string Name { get; set; } = string.Empty; 

        [StringLength(1000, ErrorMessage = "Опис закупівлі не може перевищувати 1000 символів.")]
        public string? Description { get; set; } 

        [Required(ErrorMessage = "Категорія є обов'язковою.")]
        [StringLength(100, ErrorMessage = "Категорія не може перевищувати 100 символів.")]
        public string Category { get; set; } = string.Empty; 

        public double QuantityOrVolume { get; set; } 

        [Column(TypeName = "decimal(18, 2)")]
        public decimal EstimatedBudget { get; set; }

        public DateTime CompletionDate { get; set; }

        public string? DocumentPaths { get; set; } 

        [Required]
        public Guid UserId { get; set; } 

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 

        public ProcurementStatus Status { get; set; } = ProcurementStatus.Open;

        [StringLength(500, ErrorMessage = "Адреса доставки не може перевищувати 500 символів.")]
        public string? DeliveryAddress { get; set; } 

        [StringLength(20, ErrorMessage = "Контактний номер телефону не може перевищувати 20 символів.")]
        public string? ContactPhone { get; set; }    
    }
}