using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MateralReleaseCenter.DeployServer.Repository.Migrations
{
    /// <inheritdoc />
    public partial class Add_GlobalParameter_And_GlobalEnvironment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Environments",
                table: "ApplicationInfo",
                type: "TEXT",
                nullable: true,
                comment: "环境变量");

            migrationBuilder.CreateTable(
                name: "GlobalEnvironment",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApplicationType = table.Column<byte>(type: "INTEGER", nullable: false, comment: "应用程序类型"),
                    Key = table.Column<string>(type: "TEXT", nullable: false, comment: "键"),
                    Value = table.Column<string>(type: "TEXT", nullable: false, comment: "值"),
                    Description = table.Column<string>(type: "TEXT", nullable: true, comment: "描述"),
                    CreateTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdateTime = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalEnvironment", x => x.ID);
                },
                comment: "全局环境变量");

            // 将 DefaultData 重命名为 GlobalParameter
            migrationBuilder.RenameTable(
                name: "DefaultData",
                newName: "GlobalParameter");

            // 将 Key 列重命名为 Name
            migrationBuilder.RenameColumn(
                table: "GlobalParameter",
                name: "Key",
                newName: "Name");

            // 将 Data 列重命名为 Value
            migrationBuilder.RenameColumn(
                table: "GlobalParameter",
                name: "Data",
                newName: "Value");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GlobalEnvironment");

            // 将 Value 列重命名回 Data
            migrationBuilder.RenameColumn(
                table: "GlobalParameter",
                name: "Value",
                newName: "Data");

            // 将 Name 列重命名回 Key
            migrationBuilder.RenameColumn(
                table: "GlobalParameter",
                name: "Name",
                newName: "Key");

            // 将 GlobalParameter 表重命名回 DefaultData
            migrationBuilder.RenameTable(
                name: "GlobalParameter",
                newName: "DefaultData");

            migrationBuilder.DropColumn(
                name: "Environments",
                table: "ApplicationInfo");
        }
    }
}
