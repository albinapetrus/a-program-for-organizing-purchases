// Models/DTO/CreateOfferDto.cs
using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Для IFormFile

namespace UkrainianTraiding.Models.DTO // Переконайся, що простір імен відповідає
{
    public class CreateOfferDto
    {
        // ID закупівлі, на яку надсилається відгук
        [Required(ErrorMessage = "ID закупівлі обов'язковий.")]
        public Guid ProcurementId { get; set; }

        // Ціна, запропонована постачальником (приймаємо як рядок для зручності парсингу)
        [Required(ErrorMessage = "Запропонована ціна обов'язкова.")]
        public string ProposedPrice { get; set; } = string.Empty;

        // Коментар або повідомлення від постачальника
        [StringLength(1000, ErrorMessage = "Повідомлення не може перевищувати 1000 символів.")]
        public string? Message { get; set; }

        // Поле для завантаження документів пропозиції
        [DataType(DataType.Upload)]
        // Якщо документ пропозиції обов'язковий, додай [Required].
        public IFormFile? OfferDocument { get; set; } // Назва поля, яке очікує бекенд
    }
}