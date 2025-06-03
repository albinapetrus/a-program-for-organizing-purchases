using System.ComponentModel.DataAnnotations;

namespace UkrainianTraiding.API.Models.Domain
{
    public class User
    {
        [Key] 
        public Guid Id { get; set; }

        [Required] 
        [EmailAddress] 
        [MaxLength(256)] 
        public string Email { get; set; } = string.Empty;

        [Required]
        public string? HashedPassword { get; set; } = string.Empty;
        public string? Role { get; set; } 
        public string? LegalStatus { get; set; } 
        public string? FullName { get; set; }
        public string? Ipn { get; set; } 
        public DateTime? DateOfBirth { get; set; } 
        public string? PassportPhotoPath { get; set; } 

        [StringLength(255)] 
        public string? CompanyName { get; set; } 
        [StringLength(100)] 
        public string? Category { get; set; }
    }
}
