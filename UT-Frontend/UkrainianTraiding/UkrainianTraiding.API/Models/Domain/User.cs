using System.ComponentModel.DataAnnotations;

namespace UkrainianTraiding.API.Models.Domain
{
    public class User
    {
        [Key] // Вказує, що це первинний ключ
        public Guid Id { get; set; }

        [Required] // Вказує, що поле обов'язкове
        [EmailAddress] // Додає валідацію формату email
        [MaxLength(256)] // Обмеження довжини для поля email
        public string Email { get; set; } = string.Empty; // string.Empty для уникнення null

        [Required]
        public string? HashedPassword { get; set; } = string.Empty;
        public string? Role { get; set; } // "supplier" або "customer"
        public string? LegalStatus { get; set; } // "fiz" або "ur"
        public string? FullName { get; set; }
        public string? Ipn { get; set; } // Назва може бути IPN або Ipn
        public DateTime? DateOfBirth { get; set; } // Використовуємо nullable DateTime
        public string? PassportPhotoPath { get; set; } // Шлях до збереженого файлу

        [StringLength(255)] // Можна додати обмеження довжини
        public string? CompanyName { get; set; } // Nullable, якщо збирається пізніше
        [StringLength(100)] // Можна додати обмеження довжини
        public string? Category { get; set; }
    }
}
