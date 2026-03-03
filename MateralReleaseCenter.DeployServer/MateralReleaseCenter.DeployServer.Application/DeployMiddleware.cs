using MateralReleaseCenter.DeployServer.Abstractions.Services.Models;
using Microsoft.AspNetCore.Http;

namespace MateralReleaseCenter.DeployServer.Application;

/// <summary>
/// Deploy中间件
/// </summary>
public class DeployMiddleware(RequestDelegate next)
{
    private static readonly string[] ExcludeExtensions = [".html", ".js", ".css", ".json", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".map"];
    /// <summary>
    /// 执行
    /// </summary>
    /// <param name="httpContext"></param>
    /// <returns></returns>
    public async Task InvokeAsync(HttpContext httpContext)
    {
        if (!httpContext.Request.Path.HasValue || string.IsNullOrWhiteSpace(httpContext.Request.Path.Value)) return;
        IApplicationInfoService applicationInfoService = httpContext.RequestServices.GetRequiredService<IApplicationInfoService>();
        string[] paths = httpContext.Request.Path.Value.Split("/");
        IApplicationRuntimeModel? applicationRuntimeModel = applicationInfoService.GetApplicationRuntimeModel(paths[1]);
        if (applicationRuntimeModel is null ||
            applicationRuntimeModel.ApplicationInfo.ApplicationType != ApplicationTypeEnum.StaticDocument ||
            applicationRuntimeModel.ApplicationStatus == ApplicationStatusEnum.Runing)
        {
            if (applicationRuntimeModel is not null && applicationRuntimeModel.ApplicationInfo.ApplicationType == ApplicationTypeEnum.StaticDocument)
            {
                if (paths.Length == 3 && string.IsNullOrWhiteSpace(paths[2]))
                {
                    paths[2] = "index.html";
                    httpContext.Request.Path = string.Join('/', paths);
                }
                else if (paths.Length == 2)
                {
                    httpContext.Request.Path = string.Join('/', paths) + "/index.html";
                }
                else // 处理SPA路由
                {
                    string pathValue = httpContext.Request.Path.Value;
                    // 判断是否是文件请求（带文件扩展名）
                    bool isFileRequest = ExcludeExtensions.Any(ext => pathValue.EndsWith(ext, StringComparison.OrdinalIgnoreCase));
                    if (!isFileRequest)
                    {
                        // SPA路由：非文件请求都重写到Index.html
                        int index = pathValue.IndexOf(paths[1], StringComparison.OrdinalIgnoreCase);
                        if (index >= 0)
                        {
                            string basePath = pathValue[..(index + paths[1].Length)];
                            httpContext.Request.Path = basePath + "/index.html";
                        }
                    }
                }
            }
            await next(httpContext);
        }
        else
        {
            httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
        }
    }
}
