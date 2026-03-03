using Materal.Utils.Extensions;
using Microsoft.Extensions.Configuration;
using MateralReleaseCenter.EnvironmentServer.ConfigClient;

namespace Materal.MergeBlock.RemoteConfig;

/// <summary>
/// Consul模块
/// </summary>
public class RemoteConfigModule() : MergeBlockModule("远程配置模块")
{
    /// <inheritdoc/>
    public override void OnPreConfigureServices(ServiceConfigurationContext context)
    {
        if (context.Configuration is null || context.Configuration is not IConfigurationBuilder config) return;
        string? configUrl = null;
        MergeBlockContext? mergeBlockContext = context.Services.GetSingletonInstance<MergeBlockContext>();
        if (mergeBlockContext is not null)
        {
            configUrl = mergeBlockContext.Args.FirstOrDefault(m => m.StartsWith("ConfigUrl"));
            if (!string.IsNullOrWhiteSpace(configUrl))
            {
                string[] configUrls = configUrl.Split("=");
                if (configUrls.Length == 2)
                {
                    configUrl = configUrls[1];
                }
            }
        }
        if (string.IsNullOrWhiteSpace(configUrl) || !configUrl.IsUrl())
        {
            configUrl = context.Configuration.GetConfigItem<string>("RemoteConfig:Url");
        }
        if (string.IsNullOrWhiteSpace(configUrl) || !configUrl.IsUrl()) return;
        string? project = context.Configuration.GetConfigItem<string>("RemoteConfig:Project");
        if (string.IsNullOrWhiteSpace(project)) return;
        string[]? namespaces = context.Configuration.GetConfigItem<string[]>("RemoteConfig:Namespace") ?? [];
        int reloadInterval = context.Configuration.GetConfigItem<int>("RemoteConfig:ReloadInterval");
        if (reloadInterval == 0) reloadInterval = 30;
        config.AddMRCConfig(configUrl, project, namespaces, TimeSpan.FromSeconds(reloadInterval));
    }
}
