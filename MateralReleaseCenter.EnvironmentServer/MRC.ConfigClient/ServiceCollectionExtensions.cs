using Materal.Utils.Network;
using Microsoft.Extensions.DependencyInjection;

namespace MRC.ConfigClient;

/// <summary>
/// 容器扩展
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// 添加MRC配置
    /// </summary>
    /// <param name="services">构建器</param>
    /// <returns></returns>
    public static IServiceCollection AddMRCConfig(this IServiceCollection services)
    {
        services.AddMateralNetworkUtils();
        return services;
    }
}