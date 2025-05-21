// Controllers/SupplierOffersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Models.DTO; // Переконайся, що using є
using UkrainianTraiding.API.Models.Domain; // Переконайся, що using є
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting; // Потрібен для обробки файлів
using System.IO;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

// !!! Базовий маршрут для дій постачальника з пропозиціями !!!
[Route("api/supplier/offers")] // Маршрут буде /api/supplier/offers
[ApiController]
// !!! Обмежити доступ тільки постачальникам на рівні контролера !!!
[Authorize(Roles = "supplier")]
public class SupplierOffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _hostingEnvironment; // Потрібен для методу CreateOffer

    public SupplierOffersController(ApplicationDbContext context, IWebHostEnvironment hostingEnvironment)
    {
        _context = context;
        _hostingEnvironment = hostingEnvironment;
    }

    // !!! МЕТОД: Створити пропозицію (перенесено з OffersController) !!!
    // Маршрут: POST /api/supplier/offers
    [HttpPost]
    // [Authorize(Roles = "supplier")] - вже на контролері
    public async Task<IActionResult> CreateOffer([FromForm] CreateOfferDto offerDto)
    {
        // Код методу CreateOffer повністю переносимо сюди зOffersController.cs
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

        var procurementExists = await _context.Procurements.AnyAsync(p => p.Id == offerDto.ProcurementId);
        if (!procurementExists)
        {
            return NotFound("Закупівля з таким ID не знайдена.");
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


    // !!! НОВИЙ МЕТОД: Отримати список своїх пропозицій !!!
    // Маршрут: GET /api/supplier/offers/my
    //[HttpGet("my")]
    //// [Authorize(Roles = "supplier")] - вже на контролері
    //public async Task<IActionResult> GetMyOffers()
    //{
    //    var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    //    if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
    //    {
    //        return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
    //    }

    //    // Отримуємо всі пропозиції поточного постачальника
    //    var myOffers = await _context.Offers
    //        .Where(o => o.SupplierUserId == supplierUserId) // Фільтруємо за ID поточного постачальника
    //                                                        // Можна включити закупівлю, щоб показати, до якої закупівлі пропозиція
    //                                                        // .Include(o => o.Procurement)
    //        .OrderByDescending(o => o.OfferDate)
    //        // Проектуємо у DTO (можливо, потрібен окремий DTO для списку)
    //        .Select(o => new OfferDto // Використовуємо OfferDto або інший відповідний DTO
    //        {
    //            Id = o.Id,
    //            ProcurementId = o.ProcurementId,
    //            ProposedPrice = o.ProposedPrice,
    //            Message = o.Message, // Можливо, обмежити довжину або прибрати для списку
    //            OfferDocumentPaths = o.OfferDocumentPaths,
    //            OfferDate = o.OfferDate,
    //            Status = o.Status.ToString(),
    //            // Додати поля із закупівлі, якщо Include Procurement
    //            // ProcurementName = o.Procurement.Name
    //        })
    //        .ToListAsync();

    //    return Ok(myOffers); // Повертаємо список пропозицій постачальника
    //}

    // !!! МЕТОД: Отримати деталі своєї пропозиції за ID (перенесено і доопрацьовано) !!!
    // Маршрут: GET /api/supplier/offers/{id}
    //[HttpGet("{id}")]
    //// [Authorize(Roles = "supplier")] - вже на контролері
    //public async Task<IActionResult> GetOfferById(Guid id)
    //{
    //    var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    //    if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
    //    {
    //        return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
    //    }

    //    var offer = await _context.Offers
    //         // Можна включити пов'язані дані, якщо потрібні
    //         // .Include(o => o.Procurement)
    //         // .Include(o => o.SupplierUser) // Не потрібно, якщо перевіряємо ID поточного
    //         .FirstOrDefaultAsync(o => o.Id == id);

    //    if (offer == null)
    //    {
    //        return NotFound("Пропозиція з таким ID не знайдена."); // Повертаємо 404
    //    }

    //    // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ цієї пропозиції !!!
    //    if (offer.SupplierUserId != supplierUserId)
    //    {
    //        // Якщо ID постачальника пропозиції не співпадає з ID поточного користувача
    //        return Forbid("Вам заборонено переглядати деталі цієї пропозиції."); // Повертаємо 403 Forbidden
    //    }
    //    // Якщо перевірка успішна, постачальник може бачити свою пропозицію

    //    // Проектуємо у DTO для відповіді
    //    var offerDto = new OfferDto // Або інший DTO для деталей
    //    {
    //        Id = offer.Id,
    //        ProcurementId = offer.ProcurementId,
    //        ProposedPrice = offer.ProposedPrice,
    //        Message = offer.Message,
    //        OfferDocumentPaths = offer.OfferDocumentPaths,
    //        OfferDate = offer.OfferDate,
    //        Status = offer.Status.ToString()
    //        // Додати поля з Include, якщо вони були
    //    };

    //    return Ok(offerDto); // Повертаємо деталі пропозиції
    //}


    // !!! МЕТОД: Видалити пропозицію (перенесено і доопрацьовано) !!!
    // Маршрут: DELETE /api/supplier/offers/{id}
    [HttpDelete("{id}")]
    // [Authorize(Roles = "supplier")] - вже на контролері
    public async Task<IActionResult> DeleteOffer(Guid id)
    {
        var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
        }

        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null)
        {
            return NotFound("Пропозиція з таким ID не знайдена.");
        }

        // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ цієї пропозиції !!!
        if (offer.SupplierUserId != supplierUserId)
        {
            return Forbid("Вам заборонено видаляти цю пропозицію."); // Повертаємо 403
        }
        // !!! Додаткова перевірка статусу: чи можна видаляти пропозицію у поточному статусі !!!
        if (offer.Status != OfferStatus.Submitted)
        {
            // Якщо статус не "Надіслано" (Submitted), забороняємо видалення
            return Forbid($"Пропозицію не можна видалити у статусі '{offer.Status}'. Видаляти можна лише пропозиції у статусі '{OfferStatus.Submitted}'.");
        }


        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно видалено!" });
    }

    // !!! Методи AcceptOffer та RejectOffer ТУТ НЕ ПОТРІБНІ (це дії Замовника) !!!
    // ... (жодних інших методів, що стосуються дій Замовника) ...
}