using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; 

namespace UkrainianTraiding.Models.DTO 
{
    public class CreateProcurementDto
    {
        [Required(ErrorMessage = "Назва закупівлі обов'язкова.")]
        [StringLength(255, ErrorMessage = "Назва закупівлі не може перевищувати 255 символів.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Опис закупівлі не може перевищувати 1000 символів.")]
        public string? Description { get; set; } 

        [Required(ErrorMessage = "Категорія обов'язкова.")]
        [StringLength(100, ErrorMessage = "Категорія не може перевищувати 100 символів.")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Кількість/Обсяг обов'язковий.")]
        public string QuantityOrVolume { get; set; } = string.Empty;

        [Required(ErrorMessage = "Орієнтовний бюджет обов'язковий.")]
        public string EstimatedBudget { get; set; } = string.Empty;

        [Required(ErrorMessage = "Дата завершення закупівлі обов'язкова.")]
        [DataType(DataType.Date)]
        public DateTime CompletionDate { get; set; }

        [DataType(DataType.Upload)]
        public IFormFile? SupportingDocument { get; set; } 
        [StringLength(500, ErrorMessage = "Адреса доставки не може перевищувати 500 символів.")]
        public string? DeliveryAddress { get; set; } 

        [StringLength(20, ErrorMessage = "Номер телефону не може перевищувати 20 символів.")]
        public string? ContactPhone { get; set; }   
    }
}