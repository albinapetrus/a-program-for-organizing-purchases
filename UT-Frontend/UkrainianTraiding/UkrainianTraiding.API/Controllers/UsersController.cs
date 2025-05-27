// Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UkrainianTraiding.API.Data; // Простір імен для DbContext
using UkrainianTraiding.API.Models.Domain; // Простір імен для твоєї моделі User
using UkrainianTraiding.Models.DTOs; // <<-- ДОДАНО: Простір імен для UpdateCompanyNameRequest та UserProfileDto

[Route("api/[controller]")] // Базовий маршрут для контролера: /api/users
[ApiController] // Вказує, що це API контролер
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    // Конструктор з ін'єкцією залежностей (ApplicationDbContext)
    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Ендпоінт для отримання профілю поточного авторизованого користувача
    [HttpGet("profile")] // Маршрут: /api/users/profile
    [Authorize] // Доступно лише для авторизованих користувачів
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
            // Логування помилки для налагодження
            // Приклад: private readonly ILogger<UsersController> _logger;
            // _logger.LogError(ex, "Помилка при отриманні профілю користувача.");

            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні профілю.", details = ex.Message });
        }
    }

    // --- НОВИЙ МЕТОД: Оновлення назви компанії ---
    [HttpPatch("company-name")] // Маршрут: /api/users/company-name
    [Authorize] // Доступно лише для авторизованих користувачів
    public async Task<IActionResult> UpdateCompanyName([FromBody] UpdateCompanyNameRequest request)
    {
        try
        {
            // Перевірка на валідність вхідних даних
            if (string.IsNullOrWhiteSpace(request.CompanyName))
            {
                return BadRequest(new { message = "Назва компанії не може бути порожньою." });
            }

            // Отримуємо ID користувача з JWT токена
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                return Unauthorized(new { message = "Не вдалося визначити ідентифікатор користувача з токена." });
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized(new { message = "Невірний формат ідентифікатора користувача в токені." });
            }

            // Знаходимо користувача в базі даних
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Користувача не знайдено." });
            }

            // Оновлюємо назву компанії
            user.CompanyName = request.CompanyName.Trim(); // .Trim() видаляє зайві пробіли

            // Зберігаємо зміни в базі даних
            await _context.SaveChangesAsync();

            // Повертаємо повідомлення про успіх та нову назву компанії
            return Ok(new { message = "Назва компанії успішно оновлена!", companyName = user.CompanyName });
        }
        catch (DbUpdateException ex)
        {
            // Логування помилок бази даних
            Console.WriteLine($"Помилка при оновленні назви компанії: {ex.Message}");
            return StatusCode(500, new { message = "Помилка бази даних при збереженні змін. Спробуйте пізніше." });
        }
        catch (Exception ex)
        {
            // Загальна обробка інших непередбачених помилок
            Console.WriteLine($"Непередбачена помилка при оновленні назви компанії: {ex.Message}");
            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при оновленні профілю.", details = ex.Message });
        }
    }
}