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
        double quantityOrVolume;
        decimal estimatedBudget;

        if (!double.TryParse(procurementDto.QuantityOrVolume, NumberStyles.Any, CultureInfo.InvariantCulture, out quantityOrVolume))
        {
            ModelState.AddModelError(nameof(procurementDto.QuantityOrVolume), "Невірний формат для кількості/обсягу.");
        }
        else if (quantityOrVolume <= 0.0)
        {
            ModelState.AddModelError(nameof(procurementDto.QuantityOrVolume), "Кількість/Обсяг має бути більше нуля.");
        }

        if (!decimal.TryParse(procurementDto.EstimatedBudget, NumberStyles.Any, CultureInfo.InvariantCulture, out estimatedBudget))
        {
            ModelState.AddModelError(nameof(procurementDto.EstimatedBudget), "Невірний формат для орієнтовного бюджету.");
        }
        else if (estimatedBudget <= 0.0m)
        {
            ModelState.AddModelError(nameof(procurementDto.EstimatedBudget), "Орієнтовний бюджет має бути більше нуля.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        string? documentPath = null;
        if (procurementDto.SupportingDocument != null && procurementDto.SupportingDocument.Length > 0)
        {
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "procurement_documents");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(procurementDto.SupportingDocument.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await procurementDto.SupportingDocument.CopyToAsync(stream);
            }
            documentPath = "/uploads/procurement_documents/" + uniqueFileName;
        }

        var newProcurement = new Procurement
        {
            Id = Guid.NewGuid(),
            Name = procurementDto.Name,
            Description = procurementDto.Description,
            Category = procurementDto.Category,
            QuantityOrVolume = quantityOrVolume,
            EstimatedBudget = estimatedBudget,
            CompletionDate = procurementDto.CompletionDate,
            DocumentPaths = documentPath,
            DeliveryAddress = procurementDto.DeliveryAddress,
            ContactPhone = procurementDto.ContactPhone,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            Status = ProcurementStatus.Open
        };

        _context.Procurements.Add(newProcurement);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Закупівлю успішно створено!", procurementId = newProcurement.Id });
    }


    [HttpGet("my")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> GetMyProcurements()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача за токеном.");
        }

        var userProcurements = await _context.Procurements
            .Where(p => p.UserId == userId)
            .Include(p => p.User) 
            .OrderByDescending(p => p.CreatedAt)
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
                DeliveryAddress = p.DeliveryAddress,
                ContactPhone = p.ContactPhone,
                CreatedAt = p.CreatedAt,
                Status = p.Status.ToString(),
                CustomerName = p.User != null ? p.User.CompanyName : "Невідомий замовник"
            })
            .ToListAsync();

        return Ok(userProcurements);
    }

    [HttpGet]
    [Authorize(Roles = "supplier")] 
    public async Task<IActionResult> GetAllProcurements()
    {
        var allProcurements = await _context.Procurements
            .Include(p => p.User) 
            .OrderByDescending(p => p.CreatedAt)
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
                DeliveryAddress = p.DeliveryAddress, 
                ContactPhone = p.ContactPhone,     
                CreatedAt = p.CreatedAt,
                Status = p.Status.ToString(),
                CustomerName = p.User != null ? p.User.CompanyName : "Інформація про замовника відсутня"
            })
            .ToListAsync();

        return Ok(allProcurements);
    }

    [HttpGet("search")]
    [AllowAnonymous] 
    public async Task<IActionResult> SearchProcurements(
       [FromQuery] string? name,
       [FromQuery] string? category)
    {
        try
        {
            IQueryable<Procurement> query = _context.Procurements
                                                .Include(p => p.User); 

            query = query.Where(p => p.Status == ProcurementStatus.Open);

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(p => p.Name.ToLower().Contains(name.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            var procurementsDto = await query
                .OrderByDescending(p => p.CreatedAt)
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
                    DeliveryAddress = p.DeliveryAddress,
                    ContactPhone = p.ContactPhone,
                    CreatedAt = p.CreatedAt,
                    Status = p.Status.ToString(),
                    CustomerName = p.User != null ? p.User.CompanyName : "Інформація про замовника відсутня"
                })
                .ToListAsync();

            return Ok(procurementsDto); 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SearchProcurements: {ex.ToString()}"); 
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при пошуку закупівель.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProcurementById(Guid id)
    {
        try
        {
            var procurementDto = await _context.Procurements 
                .Where(p => p.Id == id)
                .Include(p => p.User) 
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
                    DeliveryAddress = p.DeliveryAddress,
                    ContactPhone = p.ContactPhone,
                    CreatedAt = p.CreatedAt,
                    Status = p.Status.ToString(),
                    CustomerName = p.User != null ? p.User.CompanyName : "Інформація про замовника відсутня"
                })
                .FirstOrDefaultAsync();

            if (procurementDto == null)
            {
                return NotFound(new { message = "Закупівлю не знайдено." });
            }

            return Ok(procurementDto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetProcurementById: {ex.ToString()}");
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні закупівлі.", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "customer")]
    public async Task<IActionResult> DeleteProcurement(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        var procurementToDelete = await _context.Procurements.FindAsync(id);

        if (procurementToDelete == null)
        {
            return NotFound(new { message = "Закупівлю не знайдено." });
        }

        if (procurementToDelete.UserId != userId)
        {
            return Forbid("Ви не маєте дозволу на видалення цієї закупівлі.");
        }

        if (procurementToDelete.Status == ProcurementStatus.Fulfilled)
        {
            return BadRequest(new { message = "Завершені закупівлі не можуть бути видалені." });
        }

        if (!string.IsNullOrEmpty(procurementToDelete.DocumentPaths))
        {
            try
            {
                var filePath = Path.Combine(_hostingEnvironment.WebRootPath, procurementToDelete.DocumentPaths.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Помилка при видаленні файлу документа: {ex.Message}");
            }
        }


        var relatedOffers = await _context.Offers
            .Where(o => o.ProcurementId == id)
            .ToListAsync();

        foreach (var offer in relatedOffers)
        {
            offer.Status = OfferStatus.Rejected;
        }

        _context.Procurements.Remove(procurementToDelete);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Закупівлю успішно видалено." });
    }
}