//// Controllers/CustomerOffersController.cs
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Authorization;
//using UkrainianTraiding.API.Data;
//using UkrainianTraiding.Models.DTO; // Переконайся, що using є (OfferForCustomerDto, OfferDto)
//using UkrainianTraiding.API.Models.Domain; // Переконайся, що using є (Offer, OfferStatus, Procurement, User)
//using System.Security.Claims;
//using Microsoft.EntityFrameworkCore;
//// IWebHostEnvironment тут, ймовірно, не потрібен, якщо файли обробляються в SupplierOffersController
//// using Microsoft.AspNetCore.Hosting;
//// using System.IO;
//using System.Threading.Tasks;
//using System;
//using System.Collections.Generic;
//// CultureInfo тут, ймовірно, не потрібен, якщо парсинг ціни тільки в SupplierOffersController
//// using System.Globalization;
//using System.Linq;

//// !!! Базовий маршрут для дій замовника з пропозиціями !!!
//[Route("api/customer/offers")] // Маршрут буде /api/customer/offers
//[ApiController]
//// !!! Обмежити доступ тільки замовникам на рівні контролера !!!
//[Authorize(Roles = "customer")]
//public class CustomerOffersController : ControllerBase
//{
//    private readonly ApplicationDbContext _context;
//    // private readonly IWebHostEnvironment _hostingEnvironment; // Не потрібен, якщо файли обробляються в SupplierOffersController

//    public CustomerOffersController(ApplicationDbContext context /*, IWebHostEnvironment hostingEnvironment */)
//    {
//        _context = context;
//        // _hostingEnvironment = hostingEnvironment;
//    }

//    // !!! НОВИЙ МЕТОД: Отримати список пропозицій для конкретної закупівлі (перенесено з ProcurementsController) !!!
//    // Маршрут: GET /api/customer/offers/forprocurement/{procurementId}
//    [HttpGet("forprocurement/{procurementId}")] // Приймаємо ID закупівлі з маршруту
//    // [Authorize(Roles = "customer")] - вже на контролері
//    public async Task<IActionResult> GetOffersForProcurement(Guid procurementId)
//    {
//        // Код методу GetOffersForProcurement переносимо сюди з ProcurementsController.cs
//        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
//        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
//        {
//            return Unauthorized("Не вдалося ідентифікувати користувача.");
//        }

//        var procurement = await _context.Procurements
//            .AsNoTracking() // Не відстежуємо зміни для читання
//            .FirstOrDefaultAsync(p => p.Id == procurementId);

//        if (procurement == null)
//        {
//            return NotFound("Закупівля з таким ID не знайдена.");
//        }

//        // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ закупівлі !!!
//        if (procurement.UserId != customerUserId)
//        {
//            return Forbid("Вам заборонено переглядати пропозиції до цієї закупівлі.");
//        }

//        var offers = await _context.Offers
//            .Where(o => o.ProcurementId == procurementId)
//            .Include(o => o.SupplierUser) // !!! Включаємо дані постачальника !!!
//            .OrderBy(o => o.OfferDate)
//            // !!! Проектуємо у OfferForCustomerDto !!!
//            .Select(o => new OfferForCustomerDto
//            {
//                Id = o.Id,
//                ProcurementId = o.ProcurementId,
//                ProposedPrice = o.ProposedPrice,
//                Message = o.Message,
//                OfferDocumentPaths = o.OfferDocumentPaths,
//                OfferDate = o.OfferDate,
//                Status = o.Status.ToString(),
//                SupplierUserId = o.SupplierUser.Id,
//                SupplierUserName = o.SupplierUser.UserName, // Переконайся, що поле існує
//                SupplierCompanyName = o.SupplierUser.CompanyName // Переконайся, що поле існує
//            })
//            .ToListAsync();

//        return Ok(offers);
//    }

//    // !!! НОВИЙ МЕТОД: Отримати деталі пропозиції за ID (для замовника) !!!
//    // Маршрут: GET /api/customer/offers/{id}
//    [HttpGet("{id}")]
//    // [Authorize(Roles = "customer")] - вже на контролері
//    public async Task<IActionResult> GetOfferById(Guid id) // Назвемо так само, як у постачальника, але логіка різна
//    {
//        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
//        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
//        {
//            return Unauthorized("Не вдалося ідентифікувати користувача.");
//        }

//        var offer = await _context.Offers
//             .Include(o => o.Procurement) // Потрібно для перевірки власника закупівлі
//             .Include(o => o.SupplierUser) // Можна включити дані постачальника для відображення замовнику
//             .FirstOrDefaultAsync(o => o.Id == id);

//        if (offer == null)
//        {
//            return NotFound("Пропозиція з таким ID не знайдена.");
//        }

//        // !!! ПЕРЕВІРКА АВТОРИЗАЦІЇ: Чи поточний користувач є ВЛАСНИКОМ закупівлі, до якої належить пропозиція !!!
//        if (offer.Procurement == null || offer.Procurement.UserId != customerUserId)
//        {
//            return Forbid("Вам заборонено переглядати деталі цієї пропозиції."); // Повертаємо 403
//        }
//        // Якщо перевірка успішна, замовник-власник закупівлі може бачити деталі пропозиції

//        // Проектуємо у DTO для відповіді
//        var offerDto = new OfferForCustomerDto // Використовуємо DTO, що включає дані постачальника
//        {
//            Id = offer.Id,
//            ProcurementId = offer.ProcurementId,
//            ProposedPrice = offer.ProposedPrice,
//            Message = offer.Message,
//            OfferDocumentPaths = offer.OfferDocumentPaths,
//            OfferDate = offer.OfferDate,
//            Status = offer.Status.ToString(),
//            SupplierUserId = offer.SupplierUser.Id,
//            SupplierUserName = offer.SupplierUser.UserName, // Переконайся, що поле існує
//            SupplierCompanyName = offer.SupplierUser.CompanyName // Переконайся, що поле існує
//        };


//        return Ok(offerDto); // Повертаємо деталі пропозиції замовнику
//    }


//    // !!! МЕТОД: Прийняти пропозицію (перенесено з OffersController) !!!
//    // Маршрут: PUT /api/customer/offers/{id}/accept
//    [HttpPut("{id}/accept")]
//    // [Authorize(Roles = "customer")] - вже на контролері
//    public async Task<IActionResult> AcceptOffer(Guid id)
//    {
//        // Код методу AcceptOffer повністю переносимо сюди з OffersController.cs
//        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
//        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
//        {
//            return Unauthorized("Не вдалося ідентифікувати користувача.");
//        }

//        var offer = await _context.Offers
//            .Include(o => o.Procurement)
//            .FirstOrDefaultAsync(o => o.Id == id);

//        if (offer == null)
//        {
//            return NotFound("Пропозиція з таким ID не знайдена.");
//        }

//        if (offer.Procurement == null || offer.Procurement.UserId != customerUserId)
//        {
//            return Forbid("Вам заборонено приймати пропозиції до цієї закупівлі.");
//        }

//        if (offer.Status != OfferStatus.Submitted)
//        {
//            return BadRequest("Пропозицію вже було оброблено.");
//        }

//        offer.Status = OfferStatus.Accepted;

//        var otherOffers = await _context.Offers
//             .Where(o => o.ProcurementId == offer.ProcurementId && o.Id != offer.Id && o.Status == OfferStatus.Submitted)
//             .ToListAsync();

//        foreach (var otherOffer in otherOffers)
//        {
//            otherOffer.Status = OfferStatus.Rejected;
//        }

//        await _context.SaveChangesAsync();

//        return Ok(new { message = "Пропозицію успішно прийнято!", acceptedOfferId = offer.Id });
//    }


//    // !!! МЕТОД: Відхилити пропозицію (перенесено з OffersController) !!!
//    // Маршрут: PUT /api/customer/offers/{id}/reject
//    [HttpPut("{id}/reject")]
//    // [Authorize(Roles = "customer")] - вже на контролері
//    public async Task<IActionResult> RejectOffer(Guid id)
//    {
//        // Код методу RejectOffer повністю переносимо сюди з OffersController.cs
//        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
//        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
//        {
//            return Unauthorized("Не вдалося ідентифікувати користувача.");
//        }

//        var offer = await _context.Offers
//             .Include(o => o.Procurement)
//            .FirstOrDefaultAsync(o => o.Id == id);

//        if (offer == null)
//        {
//            return NotFound("Пропозиція з таким ID не знайдена.");
//        }

//        if (offer.Procurement == null || offer.Procurement.UserId != customerUserId)
//        {
//            return Forbid("Вам заборонено відхиляти пропозиції до цієї закупівлі.");
//        }

//        if (offer.Status != OfferStatus.Submitted)
//        {
//            return BadRequest("Пропозицію вже було оброблено.");
//        }

//        offer.Status = OfferStatus.Rejected;

//        await _context.SaveChangesAsync();

//        return Ok(new { message = "Пропозицію успішно відхилено!", rejectedOfferId = offer.Id });
//    }

//    // !!! Методи CreateOffer, GetMyOffers, DeleteOffer ТУТ НЕ ПОТРІБНІ (це дії Постачальника) !!!
//}