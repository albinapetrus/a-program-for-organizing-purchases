// Models/DTO/RegisterStep3Dto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace UkrainianTraiding.Models.DTO // Переконайся, що простір імен вірний
{
    public class RegisterStep3Dto
    {
        [Required(ErrorMessage = "ID користувача обов'язковий для цього етапу.")]
        public Guid UserId { get; set; } // ID користувача, переданий з фронтенду

        [Required(ErrorMessage = "Назва компанії обов'язкова.")] // Робимо обов'язковим, якщо це так за логікою
        [StringLength(255, ErrorMessage = "Назва компанії не може перевищувати 255 символів.")]
        public string CompanyName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Категорія обов'язкова.")] // Робимо обов'язковим
        [StringLength(100, ErrorMessage = "Категорія не може перевищувати 100 символів.")]
        public string Category { get; set; } = string.Empty;

        // Додай інші поля, якщо на цьому етапі збирається ще щось
    }
}