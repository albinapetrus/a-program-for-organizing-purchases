using System.ComponentModel.DataAnnotations;

namespace UkrainianTraiding.Models.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Email обов'язковий")]
        [EmailAddress(ErrorMessage = "Невірний формат email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пароль обов'язковий")]
        [MinLength(6, ErrorMessage = "Пароль має містити мінімум 6 символів")] 
        public string Password { get; set; } = string.Empty;
    }
}