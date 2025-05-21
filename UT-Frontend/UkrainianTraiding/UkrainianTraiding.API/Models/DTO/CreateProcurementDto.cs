// Models/DTO/CreateProcurementDto.cs
using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Для IFormFile

namespace UkrainianTraiding.Models.DTO // Переконайся, що простір імен відповідає
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

        // !!! ЗМІНЕНО ТИП НА string !!!
        [Required(ErrorMessage = "Кількість/Обсяг обов'язковий.")]
        // Валідацію Range можна буде реалізувати після ручного парсингу в контролері
        public string QuantityOrVolume { get; set; } = string.Empty;

        // !!! ЗМІНЕНО ТИП НА string !!!
        [Required(ErrorMessage = "Орієнтовний бюджет обов'язковий.")]
        // Валідацію Range можна буде реалізувати після ручного парсингу в контролері
        public string EstimatedBudget { get; set; } = string.Empty;

        [Required(ErrorMessage = "Дата завершення закупівлі обов'язкова.")]
        [DataType(DataType.Date)]
        public DateTime CompletionDate { get; set; }

        [DataType(DataType.Upload)]
        public IFormFile? SupportingDocument { get; set; }

        // Якщо документів декілька:
        // public List<IFormFile>? SupportingDocuments { get; set; }
    }
}