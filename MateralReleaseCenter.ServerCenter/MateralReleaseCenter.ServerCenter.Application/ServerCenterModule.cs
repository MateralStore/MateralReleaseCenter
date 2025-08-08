using Materal.MergeBlock.Consul.Abstractions;
using MateralReleaseCenter.Core.Application;
using MateralReleaseCenter.ServerCenter.Repository;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;

namespace MateralReleaseCenter.ServerCenter.Application
{
    /// <summary>
    /// ServerCenter模块
    /// </summary>
    [DependsOn(typeof(ServerCenterRepositoryModule))]
    public class ServerCenterModule() : MateralReleaseCenterModule("RCServerCenter模块")
    {
        /// <inheritdoc/>
        public override void OnConfigureServices(ServiceConfigurationContext context)
        {
            base.OnConfigureServices(context);
            context.Services.AddConsulConfig("RCServerCenter", ["MateralReleaseCenter.ServerCenter"]);
        }
        /// <inheritdoc/>
        public override void OnPreApplicationInitialization(ApplicationInitializationContext context)
        {
            string managementPath = Path.Combine(GetType().Assembly.GetDirectoryPath(), "RCManagement");
            DirectoryInfo managementDirectoryInfo = new(managementPath);
            if (!managementDirectoryInfo.Exists)
            {
                managementDirectoryInfo.Create();
                managementDirectoryInfo.Refresh();
            }
            StaticFileOptions staticFileOptions = new()
            {
                FileProvider = new PhysicalFileProvider(managementDirectoryInfo.FullName),
                RequestPath = $"/{managementDirectoryInfo.Name}",
            };
            if (context.ServiceProvider.GetRequiredService<AdvancedContext>().App is not WebApplication webApplication) return;
            webApplication.UseStaticFiles(staticFileOptions);
            context.ServiceProvider.GetService<ILogger<ServerCenterModule>>()?.LogInformation($"已启用管理界面:/{managementDirectoryInfo.Name}/Index.html");
        }
    }
}