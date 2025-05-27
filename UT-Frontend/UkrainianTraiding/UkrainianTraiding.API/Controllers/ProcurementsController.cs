// Controllers/ProcurementsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Models.DTO; // Правильний простір імен для ProcurementDto
using UkrainianTraiding.API.Models.Domain;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore; // Потрібно для .Include()
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
        // Ти вже маєш CreateProcurementDto, який містить DeliveryAddress та ContactPhone.
        // Тобі не потрібно тут їх окремо оголошувати.

        double quantityOrVolume; // Тип double для кількості/обсягу
        decimal estimatedBudget; // Тип decimal для бюджету

        // Парсинг та валідація QuantityOrVolume
        if (!double.TryParse(procurementDto.QuantityOrVolume, NumberStyles.Any, CultureInfo.InvariantCulture, out quantityOrVolume))
        {
            ModelState.AddModelError(nameof(procurementDto.QuantityOrVolume), "Невірний формат для кількості/обсягу.");
        }
        else if (quantityOrVolume <= 0.0)
        {
            ModelState.AddModelError(nameof(procurementDto.QuantityOrVolume), "Кількість/Обсяг має бути більше нуля.");
        }

        // Парсинг та валідація EstimatedBudget
        if (!decimal.TryParse(procurementDto.EstimatedBudget, NumberStyles.Any, CultureInfo.InvariantCulture, out estimatedBudget))
        {
            ModelState.AddModelError(nameof(procurementDto.EstimatedBudget), "Невірний формат для орієнтовного бюджету.");
        }
        else if (estimatedBudget <= 0.0m)
        {
            ModelState.AddModelError(nameof(procurementDto.EstimatedBudget), "Орієнтовний бюджет має бути більше нуля.");
        }

        // Якщо є помилки валідації після парсингу
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("Не вдалося ідентифікувати користувача.");
        }

        string? documentPath = null; // Зберігає шлях до ОДНОГО файлу
        if (procurementDto.SupportingDocument != null && procurementDto.SupportingDocument.Length > 0)
        {
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "procurement_documents");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            // Важливо: уникати збереження оригінального імені файлу напряму,
            // щоб запобігти можливим проблемам з безпекою або конфліктам імен.
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(procurementDto.SupportingDocument.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await procurementDto.SupportingDocument.CopyToAsync(stream);
            }
            // Зберігаємо відносний шлях, доступний з веб-сервера
            documentPath = "/uploads/procurement_documents/" + uniqueFileName;
        }

        var newProcurement = new Procurement
        {
            Id = Guid.NewGuid(),
            Name = procurementDto.Name,
            Description = procurementDto.Description,
            Category = procurementDto.Category,
            QuantityOrVolume = quantityOrVolume,   // Використовуємо спарсенe значення
            EstimatedBudget = estimatedBudget,     // Використовуємо спарсенe значення
            CompletionDate = procurementDto.CompletionDate,
            DocumentPaths = documentPath,          // Тут DocumentPaths, а не SupportingDocumentPath

            // ----- ДОДАЄМО НОВІ ПОЛЯ -----
            DeliveryAddress = procurementDto.DeliveryAddress, // Пряме присвоєння, оскільки тип string
            ContactPhone = procurementDto.ContactPhone,       // Пряме присвоєння, оскільки тип string
            // -----------------------------

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
                Status = p.Status.ToString() // Added status
            })
            .ToListAsync();

        return Ok(userProcurements);
    }

    [HttpGet]
    [Authorize(Roles = "supplier")]
    public async Task<IActionResult> GetAllProcurements()
    {
        var allProcurements = await _context.Procurements
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
                CreatedAt = p.CreatedAt,
                Status = p.Status.ToString() // Added status
            })
            .ToListAsync();

        return Ok(allProcurements);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProcurements(
       [FromQuery] string? name,
       [FromQuery] string? category)
    {
        try
        {
            IQueryable<Procurement> query = _context.Procurements;

            // Filter procurements by "Open" status for suppliers
            query = query.Where(p => p.Status == ProcurementStatus.Open);

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(p => p.Name.ToLower().Contains(name.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            var procurements = await query
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
                    CreatedAt = p.CreatedAt,
                    Status = p.Status.ToString() // Added status
                })
                .ToListAsync();

            if (!procurements.Any())
            {
                return Ok(new List<ProcurementDto>());
            }

            return Ok(procurements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при пошуку закупівель.", details = ex.Message });
        }
    }

    // Method: Get procurement by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProcurementById(Guid id)
    {
        try
        {
            var procurement = await _context.Procurements
                .Where(p => p.Id == id)
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
                    CreatedAt = p.CreatedAt,
                    Status = p.Status.ToString() // Added status
                    // CustomerCompanyName = p.Customer.CompanyName // If Procurement has Customer navigation property
                })
                .FirstOrDefaultAsync();

            if (procurement == null)
            {
                return NotFound(new { message = "Закупівлю не знайдено." });
            }

            return Ok(procurement);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні закупівлі.", details = ex.Message });
        }
    }
}