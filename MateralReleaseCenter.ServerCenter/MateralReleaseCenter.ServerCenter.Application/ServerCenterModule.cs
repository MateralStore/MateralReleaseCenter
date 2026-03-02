using MateralReleaseCenter.Core.Application;
using MateralReleaseCenter.ServerCenter.Repository;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

namespace MateralReleaseCenter.ServerCenter.Application;

/// <summary>
/// ServerCenter模块
/// </summary>
[DependsOn(typeof(ServerCenterRepositoryModule))]
public class ServerCenterModule() : MateralReleaseCenterModule("RCServerCenter模块")
{
    /// <inheritdoc/>
    public override void OnPreApplicationInitialization(ApplicationInitializationContext context)
    {
        string managementPath = Path.Combine(GetType().Assembly.GetDirectoryPath(), "MRCManagement");
        DirectoryInfo managementDirectoryInfo = new(managementPath);
        if (!managementDirectoryInfo.Exists)
        {
            managementDirectoryInfo.Create();
            managementDirectoryInfo.Refresh();
        }
        StaticFileOptions staticFileOptions = GetStaticFileOptions(managementDirectoryInfo.FullName, "");
        if (context.ServiceProvider.GetRequiredService<AdvancedContext>().App is not WebApplication webApplication) return;
        webApplication.UseStaticFiles(staticFileOptions);
        webApplication.MapFallback(async context =>
        {
            string requestPath = context.Request.Path.Value ?? "";
            string indexPath = Path.Combine(managementDirectoryInfo.FullName, "index.html");
            if (File.Exists(indexPath))
            {
                context.Response.Headers.Append("Access-Control-Allow-Methods", "*");
                context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
                context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
                await context.Response.SendFileAsync(indexPath);
            }
        });
    }
    private StaticFileOptions GetStaticFileOptions(string path, string requestPath, IFileProvider? fileProvider = null)
    {
        FileExtensionContentTypeProvider provider = new();
        provider.Mappings[".json"] = "application/json";
        provider.Mappings[".woff"] = "application/font-woff";
        provider.Mappings[".woff2"] = "application/font-woff";
        fileProvider ??= new PhysicalFileProvider(path);
        return new StaticFileOptions
        {
            FileProvider = fileProvider,
            OnPrepareResponse = OnPrepareResponse,
            RequestPath = requestPath,
            ContentTypeProvider = provider,
            ServeUnknownFileTypes = true,
            DefaultContentType = "application/octet-stream"
        };
    }
    private void OnPrepareResponse(StaticFileResponseContext context)
    {
        context.Context.Response.Headers.Append("Access-Control-Allow-Methods", "*");
        context.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        context.Context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
    }
}