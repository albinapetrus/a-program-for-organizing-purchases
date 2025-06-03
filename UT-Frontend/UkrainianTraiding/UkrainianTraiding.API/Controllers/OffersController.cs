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
using System.Globalization;
using System.Linq;
using UkrainianTraiding.API.Models.Domain.Enums; 

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _hostingEnvironment;

    public OffersController(ApplicationDbContext context, IWebHostEnvironment hostingEnvironment)
    {
        _context = context;
        _hostingEnvironment = hostingEnvironment;
    }

    [HttpPost]
    [Authorize(Roles = "supplier")]
    public async Task<IActionResult> CreateOffer([FromForm] CreateOfferDto offerDto)
    {
        if (!decimal.TryParse(offerDto.ProposedPrice, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal proposedPriceValue))
        {
            ModelState.AddModelError(nameof(offerDto.ProposedPrice), "Невірний формат для запропонованої ціни.");
        }
        else if (proposedPriceValue <= 0.0m)
        {
            ModelState.AddModelError(nameof(offerDto.ProposedPrice), "Запропонована ціна має бути більшою за нуль.");
        }

        if (offerDto.ProposedDeliveryDate < DateTime.Today)
        {
            ModelState.AddModelError(nameof(offerDto.ProposedDeliveryDate), "Пропонована дата доставки не може бути в минулому.");
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

        var procurement = await _context.Procurements.FirstOrDefaultAsync(p => p.Id == offerDto.ProcurementId);
        if (procurement == null)
        {
            return NotFound(new { message = "Закупівля з таким ID не знайдена." });
        }

        if (procurement.Status != ProcurementStatus.Open)
        {
            return BadRequest(new { message = "На цю закупівлю більше не приймаються пропозиції, оскільки вона вже не активна." });
        }

        string? offerDocumentPath = null;
        if (offerDto.OfferDocument != null && offerDto.OfferDocument.Length > 0)
        {
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "offer_documents");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(offerDto.OfferDocument.FileName);
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
            ProposedPrice = proposedPriceValue,
            Message = offerDto.Message,
            OfferDocumentPaths = offerDocumentPath,
            OfferDate = DateTime.UtcNow,
            Status = OfferStatus.Submitted,
            SupplierContactPhone = offerDto.SupplierContactPhone,
            ProposedDeliveryDate = offerDto.ProposedDeliveryDate,
            SupplierFullName = offerDto.SupplierFullName,
            PaymentEdrpou = offerDto.PaymentEdrpou,
            SupplierIban = offerDto.SupplierIban,
            SupplierBankName = offerDto.SupplierBankName,
            PaymentIpn = offerDto.PaymentIpn
        };

        _context.Offers.Add(newOffer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно надіслано!", offerId = newOffer.Id });
    }

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
            .Include(o => o.Procurement)
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

        var otherOffers = await _context.Offers
             .Where(o => o.ProcurementId == offer.ProcurementId && o.Id != offer.Id && o.Status == OfferStatus.Submitted)
             .ToListAsync();

        foreach (var otherOffer in otherOffers)
        {
            otherOffer.Status = OfferStatus.Rejected;
        }

        if (offer.Procurement != null)
        {
            offer.Procurement.Status = ProcurementStatus.Fulfilled;
            _context.Procurements.Update(offer.Procurement);
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно прийнято!", acceptedOfferId = offer.Id });
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> RejectOffer(Guid id)
    {
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        var offer = await _context.Offers
             .Include(o => o.Procurement)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null)
        {
            return NotFound("Пропозиція з таким ID не знайдена.");
        }

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

    [HttpGet("{id}")]
    [Authorize(Roles = "supplier,customer")]
    public async Task<IActionResult> GetOfferById(Guid id)
    {
        var offer = await _context.Offers
             .Include(o => o.SupplierUser)
             .Include(o => o.Procurement)
             .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null)
        {
            return NotFound(new { message = "Пропозицію не знайдено." });
        }

        var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (currentUserIdClaim == null || !Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        bool isSupplier = offer.SupplierUserId == currentUserId;
        bool isCustomer = offer.Procurement != null && offer.Procurement.UserId == currentUserId;

        if (!isSupplier && !isCustomer)
        {
            return Forbid("Вам заборонено переглядати деталі цієї пропозиції.");
        }

        var offerDetails = new OfferDetailsDto 
        {
            Id = offer.Id,
            ProcurementId = offer.ProcurementId,
            ProcurementName = offer.Procurement?.Name ?? "N/A",
            SupplierUserId = offer.SupplierUserId,
            SupplierCompanyName = offer.SupplierUser?.CompanyName,
            ProposedPrice = offer.ProposedPrice,
            Message = offer.Message,
            OfferDocumentPaths = offer.OfferDocumentPaths,
            OfferDate = offer.OfferDate,
            Status = offer.Status.ToString(),
            SupplierContactPhone = offer.SupplierContactPhone,
            ProposedDeliveryDate = offer.ProposedDeliveryDate,
            SupplierFullName = offer.SupplierFullName,
            CustomerContactPhone = offer.Procurement != null ? offer.Procurement.ContactPhone : null,
            PaymentEdrpou = offer.PaymentEdrpou,
            SupplierIban = offer.SupplierIban,
            SupplierBankName = offer.SupplierBankName,
            PaymentIpn = offer.PaymentIpn
        };
        return Ok(offerDetails);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "supplier")]
    public async Task<IActionResult> DeleteOffer(Guid id)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null)
        {
            return NotFound(new { message = "Пропозицію не знайдено." });
        }

        var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (currentUserIdClaim == null || !Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        if (offer.SupplierUserId != currentUserId)
        {
            return Forbid("Вам заборонено видаляти цю пропозицію.");
        }

        if (offer.Status != OfferStatus.Submitted)
        {
            return BadRequest(new { message = "Неможливо видалити пропозицію, яка вже була оброблена (прийнята або відхилена)." });
        }

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно видалено!" });
    }

    [HttpGet("my")]
    [Authorize(Roles = "supplier")]
    public async Task<IActionResult> GetMyOffers()
    {
        try
        {
            var supplierUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (supplierUserIdClaim == null || !Guid.TryParse(supplierUserIdClaim.Value, out var supplierUserId))
            {
                return Unauthorized("Не вдалося ідентифікувати постачальника за токеном.");
            }

            var myOffers = await _context.Offers
                .Where(o => o.SupplierUserId == supplierUserId)
                .Include(o => o.Procurement)
                .OrderByDescending(o => o.OfferDate)
                .Select(o => new OfferDetailsDto 
                {
                    Id = o.Id,
                    ProcurementId = o.ProcurementId,
                    ProcurementName = o.Procurement != null ? o.Procurement.Name : "N/A",
                    SupplierUserId = o.SupplierUserId,
                    SupplierCompanyName = o.SupplierUser != null ? o.SupplierUser.CompanyName : null,
                    ProposedPrice = o.ProposedPrice,
                    Message = o.Message,
                    OfferDocumentPaths = o.OfferDocumentPaths,
                    OfferDate = o.OfferDate,
                    Status = o.Status.ToString(),
                    SupplierContactPhone = o.SupplierContactPhone,
                    ProposedDeliveryDate = o.ProposedDeliveryDate,
                    SupplierFullName = o.SupplierFullName,
                    PaymentEdrpou = o.PaymentEdrpou,
                    SupplierIban = o.SupplierIban,
                    SupplierBankName = o.SupplierBankName,
                    PaymentIpn = o.PaymentIpn
                })
                .ToListAsync();

            return Ok(myOffers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні пропозицій.", details = ex.Message });
        }
    }

    [HttpGet("customer/offers/my")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> GetOffersToMyProcurements()
    {
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        var offers = await _context.Offers
            .Include(o => o.Procurement)
            .Include(o => o.SupplierUser)
            .Where(o => o.Procurement.UserId == customerUserId)
            .OrderByDescending(o => o.OfferDate)
            .Select(o => new OfferDetailsDto 
            {
                Id = o.Id,
                ProcurementId = o.ProcurementId,
                ProcurementName = o.Procurement.Name,
                SupplierUserId = o.SupplierUserId,
                SupplierCompanyName = o.SupplierUser != null ? o.SupplierUser.CompanyName : "Невідомий постачальник",
                ProposedPrice = o.ProposedPrice,
                Message = o.Message,
                OfferDocumentPaths = o.OfferDocumentPaths,
                OfferDate = o.OfferDate,
                Status = o.Status.ToString(),
                SupplierContactPhone = o.SupplierContactPhone,
                ProposedDeliveryDate = o.ProposedDeliveryDate,
                SupplierFullName = o.SupplierFullName,
                PaymentEdrpou = o.PaymentEdrpou,
                SupplierIban = o.SupplierIban,
                SupplierBankName = o.SupplierBankName,
                PaymentIpn = o.PaymentIpn
            })
            .ToListAsync();

        return Ok(offers);
    }
}