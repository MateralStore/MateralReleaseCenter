using Microsoft.Extensions.Configuration;

namespace MRC.ConfigClient;

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
    /// <returns></returns>
    public static IConfigurationBuilder AddMRCConfig(this IConfigurationBuilder builder, string url, string project, params string[] namespaces)
        => builder.Add(new MRCConfigurationSource(url, project, ["Application", .. namespaces]));
}
