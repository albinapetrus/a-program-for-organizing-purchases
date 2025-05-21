// ValidationAttributes/MinimumAgeAttribute.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace UkrainianTraiding.API.ValidationAttributes // Переконайся, що простір імен вірний
{
    public class MinimumAgeAttribute : ValidationAttribute
    {
        private readonly int _minimumAge;

        public MinimumAgeAttribute(int minimumAge)
        {
            _minimumAge = minimumAge;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is DateTime dateOfBirth)
            {
                var today = DateTime.Today;
                var age = today.Year - dateOfBirth.Year;

                // Відняти рік, якщо день народження ще не настав цього року
                if (dateOfBirth.Date > today.AddYears(-age))
                {
                    age--;
                }

                if (age < _minimumAge)
                {
                    // Повертаємо помилку валідації з повідомленням
                    var errorMessage = FormatErrorMessage(validationContext.DisplayName);
                    return new ValidationResult(errorMessage);
                }
            }
            // Якщо значення null або не DateTime, або валідація не потрібна в цьому випадку,
            // повертаємо ValidationResult.Success
            // Якщо поле обов'язкове, це має бути перевірено атрибутом [Required].
            return ValidationResult.Success;
        }

        // Можна перевизначити FormatErrorMessage, щоб налаштувати повідомлення за замовчуванням
        public override string FormatErrorMessage(string name)
        {
            return $"Користувачу має бути щонайменше {_minimumAge} років.";
        }
    }
}