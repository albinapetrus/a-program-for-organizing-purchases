// Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using UkrainianTraiding.API.Data;
using UkrainianTraiding.Services; // ��� ������������ Swagger, ��� ����� ���� ���������� JWT
using Microsoft.Extensions.FileProviders; // ������ ��� PhysicalFileProvider
using System.IO; // ������ ��� Path.Combine

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// ������������ DbContext � MS SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ������������ JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // � ��������� �� ���� true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true, // ��������� ����� 䳿 ������
        ClockSkew = TimeSpan.Zero // ³�������� �������� �������
    };
});

// ��������� JwtService �� Scoped service
builder.Services.AddScoped<JwtService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", // ����� �������
        builder => builder.WithOrigins("http://localhost:3000") // ��������� ������ ����� � ����� �������
                            .AllowAnyMethod() // ��������� �� HTTP ������ (GET, POST, PUT, DELETE ����)
                            .AllowAnyHeader()); // ��������� �� ���������
                                                // .AllowCredentials(); // ���� ������� ��������� ���� ��� ��������� �����������
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// ������������ Swagger ��� �������� JWT (Bearer token)
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "���� �����, ������ 'Bearer ' [�����] � ����",
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

app.UseStaticFiles(); // �� ���� ����� � wwwroot

// !!! ����� �̲��: ������ ������������ ��� ����� 'uploads' !!!
// ������������ ��� ������ ��������� ����� � ����� 'uploads'
// �� ��������� �������� ���������� ����� � /uploads/...
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "uploads")), // �������������, �� ����� 'uploads' ����������� � 'wwwroot'
    RequestPath = "/uploads" // ����, �� ���� ����� ������ ������� � URL (���������, http://localhost:7000/uploads/...)
});
// !!! ʲ���� �̲�� !!!


app.UseCors("AllowSpecificOrigin");


app.UseRouting();

// !!! �������: UseAuthentication �� ���� ����� UseAuthorization !!!
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();