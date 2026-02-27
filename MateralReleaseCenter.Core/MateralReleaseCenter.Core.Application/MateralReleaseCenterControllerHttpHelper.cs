using Consul;
using Materal.MergeBlock.Authorization.Abstractions;
using Materal.MergeBlock.Web.Abstractions;
using Materal.Utils.Network.Http;
using Microsoft.Extensions.Logging;

namespace MateralReleaseCenter.Core.Application;

/// <summary>
/// RC控制器HTTP帮助类
/// </summary>
public class MateralReleaseCenterControllerHttpHelper(IHttpHelper httpHelper, ITokenService tokenService, IOptionsMonitor<WebOptions> config, IOptionsMonitor<MergeBlockOptions> mergeBlockConfig, IOptionsMonitor<ConsulOptions> consulConfig, ILoggerFactory? loggerFactory = null) : AuthorizationControllerHttpHelper(httpHelper, tokenService, config, mergeBlockConfig, loggerFactory)
{
    private string? _serverCenterAPIName;

    /// <summary>
    /// 获取URL
    /// </summary>
    /// <param name="projectName"></param>
    /// <param name="moduleName"></param>
    /// <param name="controllerName"></param>
    /// <param name="actionName"></param>
    /// <returns></returns>
    public override string GetUrl(string projectName, string moduleName, string controllerName, string actionName)
    {
        if (string.IsNullOrWhiteSpace(_serverCenterAPIName))
        {
            Task<string> getServiceAPINameTask = Task.Run(GetServiceAPINameAsync);
            getServiceAPINameTask.Wait();
            _serverCenterAPIName = getServiceAPINameTask.Result;
        }
        string action = actionName;
        if (action.EndsWith("Async"))
        {
            action = action[..^5];
        }
        string controller = controllerName[1..^10];
        string result = $"{Config.CurrentValue.BaseUrl}/{_serverCenterAPIName}/{moduleName}API/{controller}/{action}";
        return result;
    }

    private async Task<string> GetServiceAPINameAsync()
    {
        ConsulClient consulClient = new(options => options.Address = new(consulConfig.CurrentValue.Host));
        QueryResult<Dictionary<string, string[]>> servicesResult = await consulClient.Catalog.Services();
        string result = string.Empty;
        foreach (KeyValuePair<string, string[]> item in servicesResult.Response)
        {
            if (!item.Value.Contains("MRCSC")) continue;
            result = item.Key;
            break;
        }
        return result;
    }
}
