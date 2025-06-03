using System;
using System.ComponentModel.DataAnnotations;

namespace UkrainianTraiding.Models.DTO 
{
    public class RegisterStep3Dto
    {
        [Required(ErrorMessage = "ID користувача обов'язковий для цього етапу.")]
        public Guid UserId { get; set; } 

        [Required(ErrorMessage = "Назва компанії обов'язкова.")] 
        [StringLength(255, ErrorMessage = "Назва компанії не може перевищувати 255 символів.")]
        public string CompanyName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Категорія обов'язкова.")] 
        [StringLength(100, ErrorMessage = "Категорія не може перевищувати 100 символів.")]
        public string Category { get; set; } = string.Empty;

    }
}