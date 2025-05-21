// Services/JwtService.cs
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UkrainianTraiding.API.Models.Domain;

namespace UkrainianTraiding.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            //var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]);


            var secret = "349gkz932kg92jgbm29tgnfh4r783slkaz93b29gnkfn"; // <-- ВСТАВ СЮДИ СВІЙ КЛЮЧ
            var key = Encoding.ASCII.GetBytes(secret);
            // Claims - це інформація про користувача, яка буде закодована в токені
            var claims = new List<Claim>
            {
                // NameIdentifier зазвичай використовується для унікального ID користувача
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),

                new Claim(ClaimTypes.Role, user.Role)
                // Додай інші claims, які тобі потрібні (наприклад, ClaimTypes.Role)
                // new Claim(ClaimTypes.Role, user.Role.Name) // Якщо використовуєш ролі
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}