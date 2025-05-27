// Models/DTO/CreateOfferDto.cs
using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Для IFormFile

namespace UkrainianTraiding.Models.DTO
{
    public class CreateOfferDto
    {
        [Required(ErrorMessage = "ID закупівлі обов'язковий.")]
        public Guid ProcurementId { get; set; }

        [Required(ErrorMessage = "Запропонована ціна обов'язкова.")]
        // Залишаємо string, якщо парсинг на бекенді тебе влаштовує.
        // Але для чисельних значень краще використовувати decimal або double
        // і відповідний type="number" на фронтенді.
        // Якщо залишити string, то в контролері потрібно буде парсити:
        // if (!decimal.TryParse(offerDto.ProposedPrice, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedPrice))
        // { /* обробка помилки */ }
        public string ProposedPrice { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Повідомлення не може перевищувати 1000 символів.")]
        public string? Message { get; set; }

        [DataType(DataType.Upload)]
        public IFormFile? OfferDocument { get; set; }

        // ----- НОВІ ПОЛЯ, ЯКІ МИ ДОДАЄМО -----

        [Required(ErrorMessage = "Контактний телефон постачальника є обов'язковим.")]
        [Phone(ErrorMessage = "Невірний формат телефонного номера. Приклад: +380XXXXXXXXX")]
        [RegularExpression(@"^\+?3?8?(0\d{9})$", ErrorMessage = "Невірний формат телефону. Очікується +380XXXXXXXXX або 0XXXXXXXXX.")]
        public string SupplierContactPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пропонована дата доставки є обов'язковою.")]
        [DataType(DataType.Date, ErrorMessage = "Будь ласка, введіть коректну дату.")]
        public DateTime ProposedDeliveryDate { get; set; }

        [Required(ErrorMessage = "Повне найменування (ФОП/ТОВ) є обов'язковим.")]
        [StringLength(255, MinimumLength = 3, ErrorMessage = "Повне найменування має містити від 3 до 255 символів.")]
        public string SupplierFullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "ЄДРПОУ/РНОКПП є обов'язковим.")]
        [RegularExpression(@"^\d{8}(\d{2})?$", ErrorMessage = "ЄДРПОУ/РНОКПП має складатися з 8 або 10 цифр.")]
        public string PaymentEdrpou { get; set; } = string.Empty; // ЄДРПОУ (8 цифр) або РНОКПП (10 цифр)

        [Required(ErrorMessage = "Номер рахунку IBAN є обов'язковим.")]
        [RegularExpression(@"^UA\d{2}[\dA-Z]{25}$", ErrorMessage = "Невірний формат IBAN. Має починатися з UA, далі 2 цифри, далі 25 букв/цифр (всього 29 символів).")]
        public string SupplierIban { get; set; } = string.Empty;

        [Required(ErrorMessage = "Назва банку є обов'язковою.")]
        [StringLength(255, MinimumLength = 3, ErrorMessage = "Назва банку має містити від 3 до 255 символів.")]
        public string SupplierBankName { get; set; } = string.Empty;

        // ІПН для платників ПДВ, може бути необов'язковим
        [RegularExpression(@"^\d{10}(\d{2})?$", ErrorMessage = "ІПН має складатися з 10 або 12 цифр (якщо це номер свідоцтва).")]
        public string? PaymentIpn { get; set; }
        // ---------------------------------------------
    }
}