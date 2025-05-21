// Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Services; // Для налаштування Swagger, щоб можна було передавати JWT

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Налаштування DbContext з MS SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Налаштування JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // В продакшені має бути true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true, // Перевіряти термін дії токена
        ClockSkew = TimeSpan.Zero // Відсутність часового зміщення
    };
});

// Реєстрація JwtService як Scoped service
builder.Services.AddScoped<JwtService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", // Назва політики
        builder => builder.WithOrigins("http://localhost:3000") // Дозволити запити тільки з цього джерела
                          .AllowAnyMethod() // Дозволити всі HTTP методи (GET, POST, PUT, DELETE тощо)
                          .AllowAnyHeader()); // Дозволити всі заголовки
                                              // .AllowCredentials(); // Якщо потрібно надсилати куки або заголовки авторизації
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Налаштування Swagger для підтримки JWT (Bearer token)
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Будь ласка, введіть 'Bearer ' [токен] в поле",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseCors("AllowSpecificOrigin");


app.UseRouting();

// !!! Застосування CORS політики !!!
// Цей рядок потрібно додати! Використовуй назву політики, яку ти визначив вище




app.UseHttpsRedirection();

// !!! Важливо: UseAuthentication має бути перед UseAuthorization !!!
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();