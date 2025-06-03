using System; 
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using UkrainianTraiding.API.ValidationAttributes;

namespace UkrainianTraiding.Models.DTO
{
    public class RegisterStep2Dto
    {
        [Required(ErrorMessage = "ID користувача обов'язковий для цього етапу.")]
        public Guid UserId { get; set; } 
        [StringLength(50)]
        public string Role { get; set; } 

        [Required]
        [StringLength(10)]
        public string LegalStatus { get; set; } 
        [Required]
        [StringLength(255)]
        public string FullName { get; set; }

        [Required] 
        [RegularExpression("^[0-9]{10}$", ErrorMessage = "ІПН має складатися з 10 цифр")]
        public string Ipn { get; set; }

        [MinimumAge(18, ErrorMessage = "Користувачу має бути щонайменше 18 років.")]
        public DateTime? DateOfBirth { get; set; }

        [DataType(DataType.Upload)]
        public IFormFile? PassportPhoto { get; set; }
    }
}