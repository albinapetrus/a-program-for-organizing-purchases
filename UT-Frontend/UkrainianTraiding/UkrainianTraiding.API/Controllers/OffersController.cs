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
using UkrainianTraiding.Models.DTOs;
using UkrainianTraiding.API.Models.Domain.Enums;

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
    [HttpPost]
    [Authorize(Roles = "supplier")] // Дозволити тільки постачальникам створювати пропозиції
    public async Task<IActionResult> CreateOffer([FromForm] CreateOfferDto offerDto)
    {
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

        var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
        }

        // !!! НОВА ПЕРЕВІРКА: Чи закупівля ще відкрита для пропозицій !!!
        var procurement = await _context.Procurements.FirstOrDefaultAsync(p => p.Id == offerDto.ProcurementId);
        if (procurement == null)
        {
            return NotFound("Закупівля з таким ID не знайдена.");
        }

        // Припускаємо, що Procurement має властивість Status типу ProcurementStatus
        if (procurement.Status != ProcurementStatus.Open) // Або інший статус, що означає "відкрито"
        {
            return BadRequest("На цю закупівлю більше не приймаються пропозиції, оскільки вона вже закрита або виконана.");
        }

        string? offerDocumentPath = null;
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
    [HttpPut("{id}/accept")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> AcceptOffer(Guid id)
    {
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        var offer = await _context.Offers
            .Include(o => o.Procurement) // Важливо включити закупівлю для перевірки власника та оновлення її статусу
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null)
        {
            return NotFound("Пропозиція з таким ID не знайдена.");
        }

        if (offer.Procurement == null || offer.Procurement.UserId != customerUserId)
        {
            return Forbid("Вам заборонено приймати пропозиції до цієї закупівлі.");
        }

        if (offer.Status != OfferStatus.Submitted)
        {
            return BadRequest("Пропозицію вже було оброблено.");
        }

        offer.Status = OfferStatus.Accepted;

        // Відхилити всі інші пропозиції для цієї ж закупівлі
        var otherOffers = await _context.Offers
             .Where(o => o.ProcurementId == offer.ProcurementId && o.Id != offer.Id && o.Status == OfferStatus.Submitted)
             .ToListAsync();

        foreach (var otherOffer in otherOffers)
        {
            otherOffer.Status = OfferStatus.Rejected;
        }

        // !!! НОВА ЛОГІКА: Закрити закупівлю після прийняття пропозиції !!!
        // Припускаємо, що Procurement має властивість Status типу ProcurementStatus
        if (offer.Procurement != null)
        {
            offer.Procurement.Status = ProcurementStatus.Fulfilled; // Або ProcurementStatus.Closed
            _context.Procurements.Update(offer.Procurement); // Позначаємо закупівлю як змінену
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

    [HttpGet("my")]
    [Authorize(Roles = "supplier")] // Доступно лише для постачальників
    public async Task<IActionResult> GetMyOffers()
    {
        try
        {
            // Отримуємо ID поточного аутентифікованого користувача (постачальника)
            var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
            {
                return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
            }

            // Отримуємо пропозиції, зроблені цим постачальником
            var myOffers = await _context.Offers
                .Where(o => o.SupplierUserId == supplierUserId)
                .Include(o => o.Procurement) // Включаємо дані про закупівлю
                .OrderByDescending(o => o.OfferDate) // Сортуємо за датою пропозиції
                .Select(o => new OfferListDto // Проектуємо в OfferListDto
                {
                    Id = o.Id,
                    ProcurementId = o.ProcurementId,
                    ProcurementName = o.Procurement != null ? o.Procurement.Name : "N/A", // Назва закупівлі
                    ProposedPrice = o.ProposedPrice,
                    Message = o.Message,
                    OfferDocumentPaths = o.OfferDocumentPaths,
                    OfferDate = o.OfferDate,
                    Status = o.Status.ToString() // Перетворюємо Enum на рядок
                })
                .ToListAsync();

            return Ok(myOffers);
        }
        catch (Exception ex)
        {
            // Логування помилки
            // _logger.LogError(ex, "Помилка при отриманні пропозицій постачальника.");
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні пропозицій.", details = ex.Message });
        }
    }
}