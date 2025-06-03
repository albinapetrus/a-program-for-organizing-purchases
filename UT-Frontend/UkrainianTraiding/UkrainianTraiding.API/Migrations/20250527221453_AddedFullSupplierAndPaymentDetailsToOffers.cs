using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UkrainianTraiding.API.Migrations
{
    public partial class AddedFullSupplierAndPaymentDetailsToOffers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentEdrpou",
                table: "Offers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentIpn",
                table: "Offers",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProposedDeliveryDate",
                table: "Offers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "SupplierBankName",
                table: "Offers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SupplierContactPhone",
                table: "Offers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SupplierFullName",
                table: "Offers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SupplierIban",
                table: "Offers",
                type: "nvarchar(34)",
                maxLength: 34,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentEdrpou",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "PaymentIpn",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "ProposedDeliveryDate",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SupplierBankName",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SupplierContactPhone",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SupplierFullName",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "SupplierIban",
                table: "Offers");
        }
    }
}
