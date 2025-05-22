// Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; // Для атрибута [Authorize]
using Microsoft.EntityFrameworkCore; // Для методу SingleOrDefaultAsync
using System.Security.Claims; // Для доступу до ClaimTypes
using UkrainianTraiding.API.Data; // Простір імен для DbContext
using UkrainianTraiding.API.Models.Domain; // Простір імен для твоєї моделі User
using UkrainianTraiding.Models.DTOs; // Простір імен для UserProfileDto

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
            // Отримуємо ID користувача з JWT токена
            // ClaimTypes.NameIdentifier зазвичай використовується для зберігання унікального ID користувача в JWT.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
            {
                // Ця ситуація не повинна виникнути, якщо [Authorize] спрацював коректно,
                // але це додаткова перевірка.
                return Unauthorized(new { message = "Не вдалося визначити ідентифікатор користувача з токена." });
            }

            // Парсимо ID користувача з рядка в Guid
            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return Unauthorized(new { message = "Невірний формат ідентифікатора користувача в токені." });
            }

            // Знаходимо користувача в базі даних за його ID
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                // Користувач з таким ID не знайдений у базі даних (можливо, видалений)
                return NotFound(new { message = "Профіль користувача не знайдено." });
            }

            // Створюємо DTO (Data Transfer Object) для повернення даних профілю
            // Це важливо для того, щоб не повертати чутливі дані, такі як HashedPassword.
            var userProfile = new UserProfileDto
            {
                Email = user.Email,
                CompanyName = user.CompanyName,
                Role = user.Role, // Беремо роль безпосередньо з об'єкта User
            };

            // Повертаємо дані профілю з HTTP 200 OK статусом
            return Ok(userProfile);
        }
        catch (Exception ex)
        {
            // Логування помилки для налагодження
            // Додай ILogger до конструктора, якщо хочеш використовувати логування.
            // Приклад: private readonly ILogger<UsersController> _logger;
            // _logger.LogError(ex, "Помилка при отриманні профілю користувача.");

            return StatusCode(500, new { message = "Виникла внутрішня помилка сервера при отриманні профілю.", details = ex.Message });
        }
    }

    // ТУТ МОЖНА БУДЕ ДОДАТИ ІНШІ МЕТОДИ ДЛЯ КЕРУВАННЯ КОРИСТУВАЧАМИ (НАПРИКЛАД, РЕДАГУВАННЯ ПРОФІЛЮ)
    // [HttpPut("update")]
    // [Authorize]
    // public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto updateDto) { ... }
}