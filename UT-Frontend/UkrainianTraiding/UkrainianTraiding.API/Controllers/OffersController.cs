// Controllers/OffersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Models.DTO; // Переконайся, що using є
using UkrainianTraiding.API.Models.Domain; // Переконайся, що using є
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

[Route("api/[controller]")] // Маршрут буде /api/Offers
[ApiController]
[Authorize] // Загальний Authorize для контролера - всі дії вимагають аутентифікації
public class OffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _hostingEnvironment; // Якщо обробка файлів залишиться тут

    public OffersController(ApplicationDbContext context, IWebHostEnvironment hostingEnvironment)
    {
        _context = context;
        _hostingEnvironment = hostingEnvironment;
    }

    // !!! МЕТОД: Створити пропозицію (перенесено з ProcurementsController) !!!
    // Маршрут: POST /api/Offers
    [HttpPost] // Без додаткового маршруту, POST на базовий маршрут контролера // Дані приходять як multipart/form-data (включаючи файл)
    // !!! ОБМЕЖУЄМО ДОСТУП ТІЛЬКИ КОРИСТУВАЧАМ З РОЛЛЮ "supplier" !!!
    [Authorize(Roles = "supplier")] // Дозволити тільки постачальникам створювати пропозиції
    public async Task<IActionResult> CreateOffer([FromForm] CreateOfferDto offerDto)
    {
        // Цей код повністю перенесено з ProcurementsController
        // !!! РУЧНЕ ПАРСЕННЯ ТА ВАЛІДАЦІЯ ЦІНИ !!!
        decimal proposedPrice;
        if (!decimal.TryParse(offerDto.ProposedPrice, NumberStyles.Any, CultureInfo.InvariantCulture, out proposedPrice))
        {
            ModelState.AddModelError(nameof(offerDto.ProposedPrice), "Невірний формат для запропонованої ціни.");
        }
        else if (proposedPrice < 0.0m)
        {
            ModelState.AddModelError(nameof(offerDto.ProposedPrice), "Запропонована ціна не може бути від'ємною.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        // !!! КІНЕЦЬ РУЧНОГО ПАРСЕННЯ ТА ВАЛІДАЦІЇ ЦІНИ !!!


        // !!! Отримуємо ID поточного аутентифікованого користувача (постачальника) з JWT токена !!!
        var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
        }

        // !!! Перевірка існування закупівлі, на яку надсилається пропозиція !!!
        // Можна завантажити об'єкт закупівлі повністю, якщо він потрібен для інших перевірок
        var procurementExists = await _context.Procurements.AnyAsync(p => p.Id == offerDto.ProcurementId);
        if (!procurementExists)
        {
            return NotFound("Закупівля з таким ID не знайдена.");
        }

        string? offerDocumentPath = null;
        // !!! Обробка завантаження документа пропозиції (перенесено) !!!
        if (offerDto.OfferDocument != null && offerDto.OfferDocument.Length > 0)
        {
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "offer_documents");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + offerDto.OfferDocument.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await offerDto.OfferDocument.CopyToAsync(stream);
            }
            offerDocumentPath = "/uploads/offer_documents/" + uniqueFileName;
        }
        // !!! Кінець обробки завантаження документа пропозиції !!!


        // Створюємо новий об'єкт Пропозиції (Відгуку)
        var newOffer = new Offer
        {
            Id = Guid.NewGuid(),
            ProcurementId = offerDto.ProcurementId,
            SupplierUserId = supplierUserId,
            ProposedPrice = proposedPrice,
            Message = offerDto.Message,
            OfferDocumentPaths = offerDocumentPath,
            OfferDate = DateTime.UtcNow,
            Status = OfferStatus.Submitted
        };

        _context.Offers.Add(newOffer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно надіслано!", offerId = newOffer.Id });
    }


    // !!! МЕТОД: Прийняти пропозицію (перенесено з ProcurementsController) !!!
    // Маршрут: PUT /api/Offers/{id}/accept
    [HttpPut("{id}/accept")] // Приймаємо ID пропозиції як параметр маршруту
    // !!! ОБМЕЖУЄМО ДОСТУП ТІЛЬКИ ВЛАСНИКУ ЗАКУПІВЛІ !!!
    [Authorize(Roles = "customer")] // Поки що загальна авторизація, перевірка власника всередині методу
    public async Task<IActionResult> AcceptOffer(Guid id) // Використовуємо "id" як прийнято в маршрутах /{id}
    {
        // Цей код повністю перенесено з ProcurementsController
        // !!! Отримуємо ID поточного аутентифікованого користувача (це має бути Замовник) !!!
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        // Знаходимо пропозицію в базі даних, ВКЛЮЧАЮЧИ пов'язану закупівлю
        var offer = await _context.Offers
            .Include(o => o.Procurement) // Важливо включити закупівлю для перевірки власника
            .FirstOrDefaultAsync(o => o.Id == id); // Шукаємо за ID з маршруту

        if (offer == null)
        {
            return NotFound("Пропозиція з таким ID не знайдена.");
        }

        // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ закупівлі, до якої належить пропозиція !!!
        if (offer.Procurement == null || offer.Procurement.UserId != customerUserId)
        {
            return Forbid("Вам заборонено приймати пропозиції до цієї закупівлі.");
        }

        if (offer.Status != OfferStatus.Submitted)
        {
            return BadRequest("Пропозицію вже було оброблено.");
        }

        offer.Status = OfferStatus.Accepted;

        // !!! Опціонально: Відхилити всі інші пропозиції для цієї ж закупівлі !!!
        var otherOffers = await _context.Offers
             .Where(o => o.ProcurementId == offer.ProcurementId && o.Id != offer.Id && o.Status == OfferStatus.Submitted)
             .ToListAsync();

        foreach (var otherOffer in otherOffers)
        {
            otherOffer.Status = OfferStatus.Rejected;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно прийнято!", acceptedOfferId = offer.Id });
    }


    // !!! МЕТОД: Відхилити пропозицію (перенесено з ProcurementsController) !!!
    // Маршрут: PUT /api/Offers/{id}/reject
    [HttpPut("{id}/reject")] // Приймаємо ID пропозиції як параметр маршруту
                             // !!! ОБМЕЖУЄМО ДОСТУП ТІЛЬКИ ВЛАСНИКУ ЗАКУПІВЛІ !!!
    [Authorize(Roles = "customer")] // Поки що загальна авторизація, перевірка власника всередині методу
    public async Task<IActionResult> RejectOffer(Guid id) // Використовуємо "id"
    {
        // Цей код повністю перенесено з ProcurementsController
        // !!! Отримуємо ID поточного аутентифікованого користувача (це має бути Замовник) !!!
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        // Знаходимо пропозицію
        var offer = await _context.Offers
             .Include(o => o.Procurement) // Важливо включити закупівлю для перевірки власника
            .FirstOrDefaultAsync(o => o.Id == id); // Шукаємо за ID з маршруту

        if (offer == null)
        {
            return NotFound("Пропозиція з таким ID не знайдена.");
        }

        // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ закупівлі !!!
        if (offer.Procurement == null || offer.Procurement.UserId != customerUserId)
        {
            return Forbid("Вам заборонено відхиляти пропозиції до цієї закупівлі.");
        }

        if (offer.Status != OfferStatus.Submitted)
        {
            return BadRequest("Пропозицію вже було оброблено.");
        }

        offer.Status = OfferStatus.Rejected;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно відхилено!", rejectedOfferId = offer.Id });
    }


     [HttpGet("{id}")] // GET /api/Offers/{id}
     [Authorize(Roles = "supplier")] // Можливо, обмежити доступ тільки постачальнику, який створив, або замовнику-власнику закупівлі
    public async Task<IActionResult> GetOfferById(Guid id)
    {
        var offer = await _context.Offers
             .Include(o => o.SupplierUser) // Наприклад, щоб показати, хто надіслав
             .Include(o => o.Procurement) // Наприклад, щоб показати, до якої закупівлі
             .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null)
        {
            return NotFound();
        }

        // !!! Додати перевірку авторизації: чи це пропозиція поточного користувача (постачальника),
        // чи поточний користувач є власником закупівлі цієї пропозиції (замовника) !!!
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null || (!offer.SupplierUserId.ToString().Equals(currentUserId, StringComparison.OrdinalIgnoreCase) && (offer.Procurement == null || !offer.Procurement.UserId.ToString().Equals(currentUserId, StringComparison.OrdinalIgnoreCase))))
        {
            return Forbid("Вам заборонено переглядати деталі цієї пропозиції.");
        }


        // Проектувати у DTO для відповіді, якщо потрібно
        // return Ok(new OfferDetailsDto { ... });
        return Ok(offer); // Або повертати модель, якщо не чутливі дані
    }

    [HttpDelete("{id}")] // DELETE /api/Offers/{id}
    [Authorize(Roles = "supplier")] // Можливо, дозволити видаляти тільки постачальнику, який її створив (якщо вона ще не прийнята)
    public async Task<IActionResult> DeleteOffer(Guid id)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null)
        {
            return NotFound();
        }

        // !!! Перевірка авторизації: чи це пропозиція поточного користувача (постачальника) !!!
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null || !offer.SupplierUserId.ToString().Equals(currentUserId, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid("Вам заборонено видаляти цю пропозицію.");
        }
        // Додаткова перевірка статусу: чи можна видаляти пропозицію у поточному статусі
        if (offer.Status != OfferStatus.Submitted) { return Forbid("Вам заборонено видаляти цю пропозицію."); }


        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно видалено!" });
    }
}