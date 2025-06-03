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

[Route("api/supplier/offers")] 
[ApiController]
[Authorize(Roles = "supplier")]
public class SupplierOffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _hostingEnvironment;

    public SupplierOffersController(ApplicationDbContext context, IWebHostEnvironment hostingEnvironment)
    {
        _context = context;
        _hostingEnvironment = hostingEnvironment;
    }

    [HttpPost]
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "supplier")] 
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

        if (offer.SupplierUserId != supplierUserId)
        {
            return Forbid("Вам заборонено видаляти цю пропозицію."); 
        }
        
        if (offer.Status != OfferStatus.Submitted)
        {
            return Forbid($"Пропозицію не можна видалити у статусі '{offer.Status}'. Видаляти можна лише пропозиції у статусі '{OfferStatus.Submitted}'.");
        }

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пропозицію успішно видалено!" });
    }
}