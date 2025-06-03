using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UkrainianTraiding.API.Data; 
using UkrainianTraiding.API.Models.Domain; 
using UkrainianTraiding.Models.DTOs; 

[Route("api/[controller]")] 
[ApiController] 
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")] 
    [Authorize] 
    public async Task<IActionResult> GetUserProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                return Unauthorized(new { message = "Не вдалося визначити ідентифікатор користувача з токена." });
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized(new { message = "Невірний формат ідентифікатора користувача в токені." });
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Профіль користувача не знайдено." });
            }

            var userProfile = new UserProfileDto
            {
                Email = user.Email,
                CompanyName = user.CompanyName,
                Role = user.Role,
            };

            return Ok(userProfile);
        }
        catch (Exception ex)
        {

            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні профілю.", details = ex.Message });
        }
    }

    [HttpPatch("company-name")] 
    [Authorize] 
    public async Task<IActionResult> UpdateCompanyName([FromBody] UpdateCompanyNameRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                return BadRequest(new { message = "Назва компанії не може бути порожньою." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                return Unauthorized(new { message = "Не вдалося визначити ідентифікатор користувача з токена." });
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized(new { message = "Невірний формат ідентифікатора користувача в токені." });
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Користувача не знайдено." });
            }

            user.CompanyName = request.CompanyName.Trim(); 

            await _context.SaveChangesAsync();

            return Ok(new { message = "Назва компанії успішно оновлена!", companyName = user.CompanyName });
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"Помилка при оновленні назви компанії: {ex.Message}");
            return StatusCode(500, new { message = "Помилка бази даних при збереженні змін. Спробуйте пізніше." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Непередбачена помилка при оновленні назви компанії: {ex.Message}");
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при оновленні профілю.", details = ex.Message });
        }
    }

}