using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; 
using BCrypt.Net; 
using Microsoft.EntityFrameworkCore;
using UkrainianTraiding.API.Data; 
using UkrainianTraiding.Services; 
using UkrainianTraiding.Models.DTO; 
using UkrainianTraiding.API.Models.Domain; 
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Security.Claims;
using UkrainianTraiding.Models.DTOs; 


[Route("api/[controller]")] 
[ApiController] 
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IWebHostEnvironment _hostingEnvironment; 

    public AuthController(ApplicationDbContext context, JwtService jwtService, IWebHostEnvironment hostingEnvironment) 
    {
        _context = context;
        _jwtService = jwtService;
        _hostingEnvironment = hostingEnvironment; 
    }

    [HttpPost("register")] 
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            return Conflict("Користувач з таким email вже існує.");
        }
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        var newUser = new User
        {
            Id = Guid.NewGuid(), 
            Email = registerDto.Email,
            HashedPassword = hashedPassword,
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Користувач успішно зареєстрований (Етап 1)", userId = newUser.Id });
    }

    [HttpPost("login")] 
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null)
        {
            return Unauthorized("Невірний email або пароль.");
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword);

        if (!isPasswordValid)
        {
            return Unauthorized("Невірний email або пароль.");
        }

        string token = _jwtService.GenerateToken(user);

        return Ok(new { token = token });
    }

    [HttpPut("profile/step2")] 
    public async Task<IActionResult> CompleteRegistrationStep2([FromForm] RegisterStep2Dto step2Dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); 
        }

        if (step2Dto.Role != "supplier" && step2Dto.Role != "customer")
        {
            ModelState.AddModelError(nameof(step2Dto.Role), "Невірна роль. Дозволені значення: 'supplier', 'customer'.");
            return BadRequest(ModelState); 

        }
        var userId = step2Dto.UserId;

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound("Користувача з вказаним ID не знайдено.");
        }

        user.Role = step2Dto.Role;
        user.LegalStatus = step2Dto.LegalStatus;
        user.FullName = step2Dto.FullName;
        user.Ipn = step2Dto.Ipn;
        user.DateOfBirth = step2Dto.DateOfBirth;

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

        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Етап 2 реєстрації успішно завершено. Дані профілю оновлено.", userId = user.Id });
    }

    [HttpPut("profile/step3")] 
    [Consumes("application/json")]
    [Produces("application/json")]
    public async Task<IActionResult> CompleteRegistrationStep3([FromBody] RegisterStep3Dto step3Dto)
    {
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

        user.CompanyName = step3Dto.CompanyName;
        user.Category = step3Dto.Category;

        await _context.SaveChangesAsync();

        string token = _jwtService.GenerateToken(user);

        return Ok(new { message = "Реєстрація успішно завершена!", token = token });
    }
}