// Controllers/CustomerOffersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Models.DTO; // Переконайся, що using є (OfferForCustomerDto, OfferDto)
using UkrainianTraiding.API.Models.Domain; // Переконайся, що using є (Offer, OfferStatus, Procurement, User)
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
// IWebHostEnvironment тут, ймовірно, не потрібен, якщо файли обробляються в SupplierOffersController
// using Microsoft.AspNetCore.Hosting;
// using System.IO;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
// CultureInfo тут, ймовірно, не потрібен, якщо парсинг ціни тільки в SupplierOffersController
// using System.Globalization;
using System.Linq;
using UkrainianTraiding.Models.DTOs;
using UkrainianTraiding.API.Models.DTO;

// !!! Базовий маршрут для дій замовника з пропозиціями !!!
[Route("api/customer/offers")] // Маршрут буде /api/customer/offers
[ApiController]
// !!! Обмежити доступ тільки замовникам на рівні контролера !!!
[Authorize(Roles = "customer")]
public class CustomerOffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    // private readonly IWebHostEnvironment _hostingEnvironment; // Не потрібен, якщо файли обробляються в SupplierOffersController

    public CustomerOffersController(ApplicationDbContext context /*, IWebHostEnvironment hostingEnvironment */)
    {
        _context = context;
        // _hostingEnvironment = hostingEnvironment;
    }

    // !!! НОВИЙ МЕТОД: Отримати список пропозицій для конкретної закупівлі (перенесено з ProcurementsController) !!!
    // Маршрут: GET /api/customer/offers/forprocurement/{procurementId}
    [HttpGet("forprocurement/{procurementId}")] // Приймаємо ID закупівлі з маршруту
    // [Authorize(Roles = "customer")] - вже на контролері
    public async Task<IActionResult> GetOffersForProcurement(Guid procurementId)
    {
        // Код методу GetOffersForProcurement переносимо сюди з ProcurementsController.cs
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        var procurement = await _context.Procurements
            .AsNoTracking() // Не відстежуємо зміни для читання
            .FirstOrDefaultAsync(p => p.Id == procurementId);

        if (procurement == null)
        {
            return NotFound("Закупівля з таким ID не знайдена.");
        }

        // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ закупівлі !!!
        if (procurement.UserId != customerUserId)
        {
            return Forbid("Вам заборонено переглядати пропозиції до цієї закупівлі.");
        }

        var offers = await _context.Offers
            .Where(o => o.ProcurementId == procurementId)
            .Include(o => o.SupplierUser) // !!! Включаємо дані постачальника !!!
            .OrderBy(o => o.OfferDate)
            // !!! Проектуємо у OfferForCustomerDto !!!
            .Select(o => new OfferCustomerDto
            {
                Id = o.Id,
                ProcurementId = o.ProcurementId,
                ProposedPrice = o.ProposedPrice,
                Message = o.Message,
                OfferDocumentPaths = o.OfferDocumentPaths,
                OfferDate = o.OfferDate,
                Status = o.Status.ToString(),
            })
            .ToListAsync();

        return Ok(offers);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyProcurementsOffers()
    {
        try
        {
            // Отримуємо ID поточного аутентифікованого користувача (замовника)
            var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
            {
                return Unauthorized("Не вдалося ідентифікувати користувача.");
            }

            // Отримуємо всі закупівлі, створені цим замовником
            var customerProcurementIds = await _context.Procurements
                .Where(p => p.UserId == customerUserId)
                .Select(p => p.Id)
                .ToListAsync();

            if (!customerProcurementIds.Any())
            {
                return Ok(new List<OfferCustomerDto>()); // Якщо у замовника немає закупівель, повертаємо порожній список
            }

            // Отримуємо всі пропозиції, що належать до цих закупівель
            var offers = await _context.Offers
                .Where(o => customerProcurementIds.Contains(o.ProcurementId))
                .Include(o => o.Procurement) // Включаємо дані про закупівлю
                .Include(o => o.SupplierUser) // Включаємо дані про постачальника
                .OrderByDescending(o => o.OfferDate) // Сортуємо за датою пропозиції
                .Select(o => new OfferCustomerDto
                {
                    Id = o.Id,
                    ProcurementId = o.ProcurementId,
                    ProcurementName = o.Procurement.Name,
                    ProposedPrice = o.ProposedPrice,
                    Message = o.Message,
                    OfferDocumentPaths = o.OfferDocumentPaths,
                    OfferDate = o.OfferDate,
                    Status = o.Status.ToString(), // Перетворюємо Enum на рядок
                    SupplierCompanyName = o.SupplierUser != null ? o.SupplierUser.CompanyName : "N/A - Supplier Missing"
                })
                .ToListAsync();

            return Ok(offers);
        }
        catch (Exception ex)
        {
            // Логування помилки
            // _logger.LogError(ex, "Помилка при отриманні всіх пропозицій для замовника.");
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні пропозицій.", details = ex.Message });
        }
    }
}