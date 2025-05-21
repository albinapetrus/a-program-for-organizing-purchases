// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; // Додай для атрибута [Authorize]
using BCrypt.Net; // Для хешування паролів
using Microsoft.EntityFrameworkCore;
using UkrainianTraiding.API.Data; // Простір імен для DbContext
using UkrainianTraiding.Services; // Простір імен для JwtService
using UkrainianTraiding.Models.DTO; // Простір імен для DTOs (включаючи RegisterStep2Dto)
using UkrainianTraiding.API.Models.Domain; // Простір імен для моделі User
// Додай using для роботи з файлами та IWebHostEnvironment
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Security.Claims;
using UkrainianTraiding.Models.DTOs; // Додай для доступу до ClaimsPrincipal User


[Route("api/[controller]")] // Базовий маршрут для контролера
[ApiController] // Вказує, що це API контролер
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IWebHostEnvironment _hostingEnvironment; // Додай: Для роботи з файлами

    // Конструктор з ін'єкцією залежностей (DbContext, JwtService, IWebHostEnvironment)
    public AuthController(ApplicationDbContext context, JwtService jwtService, IWebHostEnvironment hostingEnvironment) // Додай IWebHostEnvironment
    {
        _context = context;
        _jwtService = jwtService;
        _hostingEnvironment = hostingEnvironment; // Ініціалізуй
    }

    [HttpPost("register")] // POST запит на /api/auth/register (Перший етап)
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        // Перевірка валідності моделі DTO
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Перевірка на існування користувача з таким email
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            return Conflict("Користувач з таким email вже існує.");
        }

        // Хешування пароля
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Створення нового об'єкта користувача з мінімальними даними
        var newUser = new User
        {
            Id = Guid.NewGuid(), // Генеруємо GUID для нового користувача
            Email = registerDto.Email,
            HashedPassword = hashedPassword,
            // Інші поля залишаємо за замовчуванням або null/порожніми
            // Role, LegalStatus, FullName, Ipn, DateOfBirth, PassportPhotoPath
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Можливо, тут варто одразу повернути токен для аутентифікації на наступних етапах
        // string token = _jwtService.GenerateToken(newUser);
        // return Ok(new { message = "Користувач успішно зареєстрований (Етап 1)", token = token });

        // Або просто повідомлення про успіх першого етапу
        return Ok(new { message = "Користувач успішно зареєстрований (Етап 1)", userId = newUser.Id });
    }

    [HttpPost("login")] // POST запит на /api/auth/login
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        // Перевірка валідності моделі DTO
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Знаходимо користувача в базі даних за email
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDto.Email);

        // Перевірка, чи користувач знайдений
        if (user == null)
        {
            return Unauthorized("Невірний email або пароль.");
        }

        // Перевіряємо наданий пароль проти хешованого пароля з бази даних
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword);

        // Перевірка, чи пароль вірний
        if (!isPasswordValid)
        {
            return Unauthorized("Невірний email або пароль.");
        }

        // Якщо email та пароль вірні, генеруємо JWT токен
        string token = _jwtService.GenerateToken(user);

        // Повертаємо токен клієнту
        return Ok(new { token = token });
    }

    [HttpPut("profile/step2")] 
    public async Task<IActionResult> CompleteRegistrationStep2([FromForm] RegisterStep2Dto step2Dto)
    {
        // Автоматична валідація моделі RegisterStep2Dto (включаючи UserId)
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // Повертаємо 400 з деталями валідації
        }

        if (step2Dto.Role != "supplier" && step2Dto.Role != "customer")
        {
            // Додаємо кастомну помилку валідації до ModelState
            ModelState.AddModelError(nameof(step2Dto.Role), "Невірна роль. Дозволені значення: 'supplier', 'customer'.");
            return BadRequest(ModelState); // Повертаємо 400 з оновленим ModelState

        }
        // Отримуємо ID користувача з DTO, надісланого фронтендом
        var userId = step2Dto.UserId;

        // Знаходимо користувача в базі даних за цим ID
        var user = await _context.Users.FindAsync(userId);

        // Перевіряємо, чи існує користувач з таким ID
        if (user == null)
        {
            return NotFound("Користувача з вказаним ID не знайдено.");
        }

        // !!! Додаткова перевірка безпеки (РЕКОМЕНДОВАНО) !!!
        // Наприклад, перевірити, чи цей користувач ще не завершив реєстрацію.
        // Це може вимагати додавання поля Stage (int) до моделі User,
        // і перевірки, що user.Stage == 1 перед обробкою step2.
        // if (user.Stage != 1) { return BadRequest("Невірний етап реєстрації."); }


        // Оновлюємо поля існуючого користувача даними з другого етапу
        user.Role = step2Dto.Role;
        user.LegalStatus = step2Dto.LegalStatus;
        user.FullName = step2Dto.FullName;
        user.Ipn = step2Dto.Ipn;
        user.DateOfBirth = step2Dto.DateOfBirth;

        // !!! Обробка завантаження файлу паспорту (логіка та сама) !!!
        if (step2Dto.PassportPhoto != null && step2Dto.PassportPhoto.Length > 0)
        {
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads", "passport_photos");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + step2Dto.PassportPhoto.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await step2Dto.PassportPhoto.CopyToAsync(stream);
            }

            user.PassportPhotoPath = "/uploads/passport_photos/" + uniqueFileName;

            // Можна видалити попереднє фото, якщо воно існувало
        }
        // !!! Кінець обробки завантаження файлу !!!


        // Зберігаємо оновлення користувача в базі даних
        await _context.SaveChangesAsync();

        // !!! Додатково: Можна оновити поле Stage у користувача, наприклад, на 2
        // user.Stage = 2;
        // await _context.SaveChangesAsync();

        // Повертаємо успішну відповідь. Можна повернути ID або тимчасовий ключ для Етапу 3
        return Ok(new { message = "Етап 2 реєстрації успішно завершено. Дані профілю оновлено.", userId = user.Id });
    }

    [HttpPut("profile/step3")] // PUT запит на /api/auth/profile/step3
    [Consumes("application/json")]
    [Produces("application/json")]
    public async Task<IActionResult> CompleteRegistrationStep3([FromBody] RegisterStep3Dto step3Dto)
    {
        // Автоматична валідація моделі RegisterStep3Dto
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = step3Dto.UserId;
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound("Користувача з вказаним ID не знайдено.");
        }

        // !!! Додаткова перевірка безпеки та етапу реєстрації (РЕКОМЕНДОВАНО) !!!
        // Перевірити, чи user.Stage == 2 перед обробкою step3.

        // Оновлюємо дані користувача
        user.CompanyName = step3Dto.CompanyName;
        user.Category = step3Dto.Category;

        // !!! Позначаємо реєстрацію як завершену (якщо є таке поле) !!!
        // Припустимо, у тебе є поле bool IsRegistered у моделі User
        // user.IsRegistered = true;

        // Або якщо використовуєш поле Stage, оновити на фінальний етап
        // user.Stage = 3; // Або якийсь інший індикатор фінального етапу

        // Зберігаємо зміни в базі даних
        await _context.SaveChangesAsync();

        // !!! ГЕНЕРУЄМО JWT ТОКЕН ДЛЯ ЩОЙНО ЗАРЕЄСТРОВАНОГО КОРИСТУВАЧА !!!
        string token = _jwtService.GenerateToken(user);

        // !!! ПОВЕРТАЄМО ТОКЕН У ВІДПОВІДІ !!!
        return Ok(new { message = "Реєстрація успішно завершена!", token = token });
        // Тепер фронтенд отримає токен і зможе його зберегти для автоматичного логіну

    }
}