using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Models.DTO; 
using UkrainianTraiding.API.Models.Domain; 
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using UkrainianTraiding.Models.DTOs;
using UkrainianTraiding.API.Models.DTO;

[Route("api/customer/offers")] 
[ApiController]
[Authorize(Roles = "customer")]
public class CustomerOffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CustomerOffersController(ApplicationDbContext context )
    {
        _context = context;
    }

    [HttpGet("forprocurement/{procurementId}")] 
    public async Task<IActionResult> GetOffersForProcurement(Guid procurementId)
    {
        var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        var procurement = await _context.Procurements
            .AsNoTracking() 
            .FirstOrDefaultAsync(p => p.Id == procurementId);

        if (procurement == null)
        {
            return NotFound("Закупівля з таким ID не знайдена.");
        }

        if (procurement.UserId != customerUserId)
        {
            return Forbid("Вам заборонено переглядати пропозиції до цієї закупівлі.");
        }

        var offers = await _context.Offers
            .Where(o => o.ProcurementId == procurementId)
            .Include(o => o.SupplierUser)
            .OrderBy(o => o.OfferDate)
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
            var customerUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerUserIdClaim == null || !Guid.TryParse(customerUserIdClaim.Value, out var customerUserId))
            {
                return Unauthorized("Не вдалося ідентифікувати користувача.");
            }

            var customerProcurementIds = await _context.Procurements
                .Where(p => p.UserId == customerUserId)
                .Select(p => p.Id)
                .ToListAsync();

            if (!customerProcurementIds.Any())
            {
                return Ok(new List<OfferCustomerDto>()); 
            }

            var offers = await _context.Offers
                .Where(o => customerProcurementIds.Contains(o.ProcurementId))
                .Include(o => o.Procurement) 
                .Include(o => o.SupplierUser) 
                .OrderByDescending(o => o.OfferDate) 
                .Select(o => new OfferCustomerDto
                {
                    Id = o.Id,
                    ProcurementId = o.ProcurementId,
                    ProcurementName = o.Procurement.Name,
                    ProposedPrice = o.ProposedPrice,
                    Message = o.Message,
                    OfferDocumentPaths = o.OfferDocumentPaths,
                    OfferDate = o.OfferDate,
                    Status = o.Status.ToString(), 
                    ProposedDeliveryDate = o.ProposedDeliveryDate,
                    SupplierCompanyName = o.SupplierUser != null ? o.SupplierUser.CompanyName : "N/A - Supplier Missing"
                })
                .ToListAsync();

            return Ok(offers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні пропозицій.", details = ex.Message });
        }
    }
}