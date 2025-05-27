using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UkrainianTraiding.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryAddressAndContactPhoneToProcurements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "Procurements",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryAddress",
                table: "Procurements",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "Procurements");

            migrationBuilder.DropColumn(
                name: "DeliveryAddress",
                table: "Procurements");
        }
    }
}
