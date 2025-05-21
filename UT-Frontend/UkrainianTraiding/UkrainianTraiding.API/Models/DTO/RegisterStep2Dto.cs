// Models/DTO/RegisterStep2Dto.cs
using System; // Додай using для Guid
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using UkrainianTraiding.API.ValidationAttributes;

namespace UkrainianTraiding.Models.DTO
{
    public class RegisterStep2Dto
    {
        [Required(ErrorMessage = "ID користувача обов'язковий для цього етапу.")]
        public Guid UserId { get; set; } // Додаємо поле для ID користувача

        [Required]
        [StringLength(50)]
        public string Role { get; set; } // "supplier" або "customer"

        [Required]
        [StringLength(10)]
        public string LegalStatus { get; set; } // "fiz" або "ur"

        [Required]
        [StringLength(255)]
        public string FullName { get; set; }

        [Required] // Якщо ІПН обов'язковий на цьому етапі
        [RegularExpression("^[0-9]{10}$", ErrorMessage = "ІПН має складатися з 10 цифр")]
        public string Ipn { get; set; }

        // DateTime? дозволяє null, якщо дата народження необов'язкова
        [MinimumAge(18, ErrorMessage = "Користувачу має бути щонайменше 18 років.")]
        public DateTime? DateOfBirth { get; set; }

        // Поле для файлу (nullable, якщо файл необов'язковий)
        [DataType(DataType.Upload)]
        public IFormFile? PassportPhoto { get; set; }
    }
}