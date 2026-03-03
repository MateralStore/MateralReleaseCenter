using Microsoft.Extensions.Configuration;

namespace MateralReleaseCenter.EnvironmentServer.ConfigClient;

/// <summary>
/// 配置项构建器扩展
/// </summary>
public static class ConfigurationBuilderExtensions
{
    /// <summary>
    /// 添加MRC配置
    /// </summary>
    /// <param name="builder">构建器</param>
    /// <param name="url">Url</param>
    /// <param name="project">应用程序</param>
    /// <param name="namespaces">要加载的命名空间</param>
    /// <param name="reloadInterval">轮询间隔（默认 30 秒）</param>
    /// <returns></returns>
    public static IConfigurationBuilder AddMRCConfig(this IConfigurationBuilder builder, string url, string project, string[] namespaces, TimeSpan? reloadInterval = null)
    {
        string[] trueNamespaces = ["Application", .. namespaces];
        MRCConfigurationSource source = new(url, project, trueNamespaces, reloadInterval ?? TimeSpan.FromSeconds(30));
        return builder.Add(source);
    }
}
