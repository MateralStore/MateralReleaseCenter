using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MateralReleaseCenter.DeployServer.Repository.Migrations
{
    /// <inheritdoc />
    public partial class ApplicationInfo_Add_RepositoryUrl_AuthToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AuthToken",
                table: "ApplicationInfo",
                type: "TEXT",
                nullable: true,
                comment: "授权令牌");

            migrationBuilder.AddColumn<string>(
                name: "RepositoryUrl",
                table: "ApplicationInfo",
                type: "TEXT",
                nullable: true,
                comment: "仓库地址");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthToken",
                table: "ApplicationInfo");

            migrationBuilder.DropColumn(
                name: "RepositoryUrl",
                table: "ApplicationInfo");
        }
    }
}
