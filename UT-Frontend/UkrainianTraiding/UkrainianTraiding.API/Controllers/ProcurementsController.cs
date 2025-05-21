// Controllers/ProcurementsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Models.DTO;
using UkrainianTraiding.API.Models.Domain;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Globalization; // !!! ДОДАЙ ЦЕЙ using !!!

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProcurementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _hostingEnvironment;

    public ProcurementsController(ApplicationDbContext context, IWebHostEnvironment hostingEnvironment)
    {
        _context = context;
        _hostingEnvironment = hostingEnvironment;
    }

    [HttpPost]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> CreateProcurement([FromForm] CreateProcurementDto procurementDto)
    {
        // ModelState.IsValid перевірить Required та StringLength для рядків
        // Але валідацію числових значень та їх діапазону тепер потрібно робити вручну

        // !!! РУЧНЕ ПАРСЕННЯ ТА ВАЛІДАЦІЯ ЧИСЛОВИХ ПОЛІВ !!!
        double quantityOrVolume;
        decimal estimatedBudget; // Використовуємо decimal, оскільки в моделі Procurement він decimal

        // Парсимо QuantityOrVolume як double, використовуючи інваріантну культуру (точка як роздільник)
        if (!double.TryParse(procurementDto.QuantityOrVolume, NumberStyles.Any, CultureInfo.InvariantCulture, out quantityOrVolume))
        {
            ModelState.AddModelError(nameof(procurementDto.QuantityOrVolume), "Невірний формат для кількості/обсягу.");
        }
        // Валідація діапазону для QuantityOrVolume
        else if (quantityOrVolume <= 0.0) // Використовуємо 0.0 для порівняння з double
        {
            ModelState.AddModelError(nameof(procurementDto.QuantityOrVolume), "Кількість/Обсяг має бути більше нуля.");
        }


        // Парсимо EstimatedBudget як decimal, використовуючи інваріантну культуру
        if (!decimal.TryParse(procurementDto.EstimatedBudget, NumberStyles.Any, CultureInfo.InvariantCulture, out estimatedBudget))
        {
            ModelState.AddModelError(nameof(procurementDto.EstimatedBudget), "Невірний формат для орієнтовного бюджету.");
        }
        // Валідація діапазону для EstimatedBudget
        else if (estimatedBudget <= 0.0m) // Використовуємо 0.0m для порівняння з decimal
        {
            ModelState.AddModelError(nameof(procurementDto.EstimatedBudget), "Орієнтовний бюджет має бути більше нуля.");
        }

        // Перевіряємо, чи є помилки валідації після ручних перевірок та ModelState.IsValid
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // Повертаємо 400 з деталями всіх валідацій
        }
        // !!! КІНЕЦЬ РУЧНОГО ПАРСЕННЯ ТА ВАЛІДАЦІЇ !!!


        // ... (логіка отримання userId з токена - залишається без змін) ...
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача."); // Або Forbid, якщо хочеш 403
        }
        // ... (перевірка ролі, якщо потрібна) ...


        string? documentPath = null;
        // ... (логіка збереження файлу - залишається без змін) ...
        if (procurementDto.SupportingDocument != null && procurementDto.SupportingDocument.Length > 0)
        {
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "procurement_documents");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + procurementDto.SupportingDocument.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await procurementDto.SupportingDocument.CopyToAsync(stream);
            }
            documentPath = "/uploads/procurement_documents/" + uniqueFileName;
        }


        // Створюємо новий об'єкт Закупівлі
        var newProcurement = new Procurement
        {
            Id = Guid.NewGuid(),
            Name = procurementDto.Name,
            Description = procurementDto.Description,
            Category = procurementDto.Category,
            QuantityOrVolume = quantityOrVolume, // !!! Використовуємо СПАРСЕНЕ число !!!
            EstimatedBudget = estimatedBudget, // !!! Використовуємо СПАРСЕНЕ число !!!
            CompletionDate = procurementDto.CompletionDate,
            DocumentPaths = documentPath,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Додаємо нову закупівлю до контексту та зберігаємо в базі даних
        _context.Procurements.Add(newProcurement);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Закупівлю успішно створено!", procurementId = newProcurement.Id });
    }


    [HttpGet("my")] // GET запит на /api/Procurements/my
    // [Authorize] вже застосовано до всього контролера
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> GetMyProcurements()
    {
        // !!! Отримуємо ID поточного аутентифікованого користувача з JWT токена !!!
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            // Якщо токен валідний, але claims не містять User ID (вкрай малоймовірно),
            // або якщо User ID не є валідним GUID.
            // Це може бути 401 або 403 залежно від точного сценарію, але 401 більш підходить,
            // якщо проблема на етапі ідентифікації користувача з токена.
            return Unauthorized("Не вдалося ідентифікувати користувача за токеном.");
        }

        // !!! Отримуємо список закупівель з бази даних, фільтруючи за UserId !!!
        // Використовуємо LINQ для запиту
        var userProcurements = await _context.Procurements
            .Where(p => p.UserId == userId) // Фільтруємо за ID поточного користувача
            .OrderByDescending(p => p.CreatedAt) // Опціонально: сортуємо за датою створення
            .Select(p => new ProcurementDto // !!! Проектуємо результат у ProcurementDto !!!
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Category = p.Category,
                QuantityOrVolume = p.QuantityOrVolume,
                EstimatedBudget = p.EstimatedBudget,
                CompletionDate = p.CompletionDate,
                DocumentPaths = p.DocumentPaths,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(); // Виконуємо запит та отримуємо результат як List

        // Повертаємо список закупівель у відповіді 200 OK
        return Ok(userProcurements);
    }

    [HttpGet]
    // !!! ОБМЕЖУЄМО ДОСТУП ТІЛЬКИ КОРИСТУВАЧАМ З РОЛЛЮ "supplier" !!!
    [Authorize(Roles = "supplier")] // Переконайся, що назва ролі точно відповідає тій, що зберігається
    public async Task<IActionResult> GetAllProcurements()
    {
        // Отримувати ID користувача з токена для цього методу НЕ потрібно,
        // оскільки ми не фільтруємо за користувачем.
        // Атрибут [Authorize(Roles = "supplier")] вже забезпечить,
        // що сюди потраплять тільки аутентифіковані користувачі з правильною роллю.

        // !!! Отримуємо ВСІ закупівлі з бази даних !!!
        var allProcurements = await _context.Procurements
            // Опціонально: сортуємо, наприклад, за датою створення
            .OrderByDescending(p => p.CreatedAt)
            // !!! Проектуємо результат у ProcurementDto !!!
            .Select(p => new ProcurementDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Category = p.Category,
                QuantityOrVolume = p.QuantityOrVolume,
                EstimatedBudget = p.EstimatedBudget,
                CompletionDate = p.CompletionDate,
                DocumentPaths = p.DocumentPaths,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(); // Виконуємо запит та отримуємо результат як List

        // Повертаємо список всіх закупівель у відповіді 200 OK
        return Ok(allProcurements);
    }
    // ... інші методи контролера
}