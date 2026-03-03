using Microsoft.Extensions.Configuration;

namespace MateralReleaseCenter.EnvironmentServer.ConfigClient;

/// <summary>
/// 配置源
/// </summary>
public class MRCConfigurationSource(string url, string project, string[] namespaces, TimeSpan reloadInterval) : IConfigurationSource
{
    /// <summary>
    /// 配置地址
    /// </summary>
    public string Url { get; set; } = url;
    /// <summary>
    /// 应用程序
    /// </summary>
    public string Project { get; set; } = project;
    /// <summary>
    /// 命名空间组
    /// </summary>
    public string[] Namespaces { get; set; } = namespaces;
    /// <summary>
    /// 轮询间隔（默认 30 秒）
    /// </summary>
    public TimeSpan ReloadInterval { get; set; } = reloadInterval;

    /// <summary>
    /// 构建
    /// </summary>
    /// <param name="builder"></param>
    /// <returns></returns>
    public IConfigurationProvider Build(IConfigurationBuilder builder)
        => new MRCConfigurationProvider(this);
}