using Consul;
using Materal.EventBus.Abstraction;
using Materal.MergeBlock.Web.Abstractions;
using MateralReleaseCenter.Core.Application;
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.Server;
using MateralReleaseCenter.ServerCenter.Abstractions.Events;

namespace MateralReleaseCenter.ServerCenter.Application.Controllers;

/// <summary>
/// 服务控制器
/// </summary>
public partial class ServerController(IEventBus eventBus, IOptionsMonitor<ConsulOptions> consulOptions, IOptionsMonitor<WebOptions> webConfig, IOptionsMonitor<ApplicationConfig> applicationConfig) : ServerCenterController
{
    /// <summary>
    /// 获得发布程序列表
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public async Task<ResultModel<List<DeployListDTO>>> GetDeployListAsync()
    {
        ConsulClient client = new(options => options.Address = new(consulOptions.CurrentValue.Host));
        QueryResult<Dictionary<string, string[]>> servicesResult = await client.Catalog.Services();
        List<DeployListDTO> result = [];
        foreach (KeyValuePair<string, string[]> service in servicesResult.Response)
        {
            if (!service.Value.Contains("MRCDS")) continue;
            QueryResult<CatalogService[]> serviceResult = await client.Catalog.Service(service.Key);
            CatalogService serviceInfo = serviceResult.Response.First();
            DeployListDTO item = new()
            {
                Host = serviceInfo.ServiceAddress,
                Name = serviceInfo.ServiceName,
                Port = serviceInfo.ServicePort,
                AccessUrl = serviceInfo.ServiceMeta["AccessUrl"].TrimEnd('/')
            };
            result.Add(item);
        }
        result = [.. result.OrderBy(m => m.Port)];
        return ResultModel<List<DeployListDTO>>.Success(result, "查询成功");
    }
    /// <summary>
    /// 获得环境服务程序列表
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public async Task<ResultModel<List<EnvironmentServerListDTO>>> GetEnvironmentServerListAsync()
    {
        ConsulClient client = new(options => options.Address = new(consulOptions.CurrentValue.Host));
        QueryResult<Dictionary<string, string[]>> servicesResult = await client.Catalog.Services();
        List<EnvironmentServerListDTO> result = [];
        foreach (KeyValuePair<string, string[]> service in servicesResult.Response)
        {
            if (!service.Value.Contains("MRCES")) continue;
            QueryResult<CatalogService[]> serviceResult = await client.Catalog.Service(service.Key);
            CatalogService serviceInfo = serviceResult.Response.First();
            EnvironmentServerListDTO item = new()
            {
                Host = serviceInfo.ServiceAddress,
                Name = serviceInfo.ServiceName,
                Port = serviceInfo.ServicePort
            };
            result.Add(item);
        }
        result = [.. result.OrderBy(m => m.Port)];
        return ResultModel<List<EnvironmentServerListDTO>>.Success(result, "查询成功");
    }
    /// <summary>
    /// 获得基础地址
    /// </summary>
    /// <returns></returns>
    [HttpGet, AllowAnonymous]
    public ResultModel<string> GetBaseUrl()
    {
        string baseUrl = applicationConfig.CurrentValue.GatewayUrl ?? webConfig.CurrentValue.BaseUrl;
        return ResultModel<string>.Success(baseUrl, "查询成功");
    }

    /// <summary>
    /// 源码更新
    /// </summary>
    /// <param name="url"></param>
    /// <returns></returns>
    [HttpGet, AllowAnonymous]
    public async Task<ResultModel> SourceCodeUpdateAsync(string? url)
    {
        await eventBus.PublishAsync(new SourceCodeUpdateEvent() { RepositoryUrl = url });
        return ResultModel.Success("通知成功");
    }
}
