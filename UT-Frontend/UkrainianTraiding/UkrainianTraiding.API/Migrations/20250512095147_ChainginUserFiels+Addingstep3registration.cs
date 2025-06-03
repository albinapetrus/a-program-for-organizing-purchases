using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UkrainianTraiding.API.Migrations
{
    public partial class ChainginUserFielsAddingstep3registration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);
        }
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Users");
        }
    }
}
