// Models/DTO/ProcurementDto.cs
using System;
using UkrainianTraiding.API.Models.Domain.Enums;
// UkrainianTraiding.API.Models.Domain.Enums; // Цей using, схоже, не потрібен тут,
// оскільки Status вже string

namespace UkrainianTraiding.Models.DTO
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
        public string Status { get; set; } = string.Empty; // Ініціалізація для non-nullable string
        public string? CustomerName { get; set; } // Назва компанії замовника

        // ----- ДОДАНО НОВІ ПОЛЯ -----
        public string? DeliveryAddress { get; set; }
        public string? ContactPhone { get; set; }

        public Guid UserId { get; set; }

        
        // -----------------------------

        // Зазвичай тут НЕ потрібно включати UserId або об'єкт User,
        // оскільки фронтенд вже знає, що це закупівлі поточного користувача.
    }
}