// Models/Domain/Enums/ProcurementStatus.cs
namespace UkrainianTraiding.API.Models.Domain.Enums
{
    public enum ProcurementStatus
    {
        Open,      // Закупівля активна, приймає пропозиції
        Closed,    // Закупівля закрита (наприклад, пропозицію прийнято або термін вийшов)
        Fulfilled  // Закупівля успішно виконана (пропозицію прийнято і договір укладено)
    }
}
