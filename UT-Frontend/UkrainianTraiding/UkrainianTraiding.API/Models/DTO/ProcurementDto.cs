// Models/DTO/ProcurementDto.cs
using System;

namespace UkrainianTraiding.Models.DTO // Переконайся, що простір імен відповідає
{
    public class ProcurementDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public double QuantityOrVolume { get; set; }
        public decimal EstimatedBudget { get; set; } // Використовуй decimal, як у моделі
        public DateTime CompletionDate { get; set; }
        public string? DocumentPaths { get; set; } // Шляхи до документів
        public DateTime CreatedAt { get; set; } // Дата створення

        // Зазвичай тут НЕ потрібно включати UserId або об'єкт User,
        // оскільки фронтенд вже знає, що це закупівлі поточного користувача.
    }
}