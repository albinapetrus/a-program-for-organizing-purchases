using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UkrainianTraiding.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProcurementsStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Procurements",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Procurements");
        }
    }
}
