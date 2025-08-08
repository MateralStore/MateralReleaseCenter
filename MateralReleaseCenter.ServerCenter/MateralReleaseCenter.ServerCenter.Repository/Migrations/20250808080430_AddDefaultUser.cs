using Materal.Extensions;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MateralReleaseCenter.ServerCenter.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultUser : Migration
    {
        private static readonly string[] columns = [
            nameof(User.ID),
            nameof(User.Name),
            nameof(User.Account),
            nameof(User.Password),
            nameof(User.CreateTime),
            "UpdateTime"
        ];
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData("User", columns, [
                Guid.NewGuid(),
                "管理员",
                "Admin",
                $"Materal123456Materal".ToMd5_32Encode(),
                DateTime.Now,
                DateTime.Now
            ]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
