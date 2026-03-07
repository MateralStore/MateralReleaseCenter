using Materal.Extensions.DependencyInjection;
using Materal.MergeBlock.RemoteConfig.Services.DTO;
using Materal.MergeBlock.RemoteConfig.Services.Models;
using Materal.Utils.Enums;
using Materal.Utils.Extensions;
using Materal.Utils.Models;
using Materal.Utils.Network.Http;
using MateralReleaseCenter.EnvironmentServer.ConfigClient;
using Microsoft.Extensions.Configuration;

namespace Materal.MergeBlock.RemoteConfig.Services;

/// <summary>
/// 远程配置服务实现
/// </summary>
public class RemoteConfigServiceImpl(IConfiguration configuration) : IRemoteConfigService, ITransientDependency<IRemoteConfigService>
{
    private readonly HttpHelper _httpHelper = new();

    private string? _configUrl;
    private string? _project;
    private string[]? _namespaces;

    private string ConfigUrl => _configUrl ??= configuration.GetConfigItem<string>("RemoteConfig:Url") ?? string.Empty;
    private string Project => _project ??= configuration.GetConfigItem<string>("RemoteConfig:Project") ?? string.Empty;
    private string[] Namespaces => _namespaces ??= configuration.GetConfigItem<string[]>("RemoteConfig:Namespace") ?? [];

    private string[] GetNamespaceNames() => ["Application", .. Namespaces];

    /// <inheritdoc/>
    public async Task<RemoteConfigDTO?> GetConfigAsync(string key)
    {
        List<RemoteConfigDTO> list = await GetListAsync();
        return list.FirstOrDefault(m => m.Key.Equals(key, StringComparison.OrdinalIgnoreCase));
    }

    /// <inheritdoc/>
    public async Task<List<RemoteConfigDTO>> GetListAsync()
    {
        if (string.IsNullOrWhiteSpace(ConfigUrl) || string.IsNullOrWhiteSpace(Project)) return [];

        CollectionResultModel<ConfigItem> dataResult = await _httpHelper.SendPostAsync<CollectionResultModel<ConfigItem>>(
            $"{ConfigUrl}/EnvironmentServerAPI/ConfigurationItem/GetList",
            null,
            new
            {
                PageIndex = 1,
                PageSize = int.MaxValue,
                ProjectName = Project,
                NamespaceNames = GetNamespaceNames()
            });

        if (dataResult.ResultType != ResultType.Success || dataResult.Data is null) return [];

        return [.. dataResult.Data.Select(m => new RemoteConfigDTO
        {
            Key = m.Key,
            Value = m.Value,
            Description = m.Description
        })];
    }

    /// <inheritdoc/>
    public async Task EditConfigAsync(EditRemoteConfigModel model)
    {
        if (string.IsNullOrWhiteSpace(ConfigUrl) || string.IsNullOrWhiteSpace(Project)) throw new InvalidOperationException("远程配置未初始化");

        CollectionResultModel<ConfigItem> dataResult = await _httpHelper.SendPostAsync<CollectionResultModel<ConfigItem>>(
            $"{ConfigUrl}/EnvironmentServerAPI/ConfigurationItem/GetList",
            null,
            new
            {
                PageIndex = 1,
                PageSize = int.MaxValue,
                ProjectName = Project,
                NamespaceNames = GetNamespaceNames()
            });

        if (dataResult.ResultType != ResultType.Success || dataResult.Data is null) throw new InvalidOperationException("获取配置列表失败");

        ConfigItem configItem = dataResult.Data.FirstOrDefault(m => m.Key.Equals(model.Key, StringComparison.OrdinalIgnoreCase)) ?? throw new InvalidOperationException($"配置项 {model.Key} 不存在");
        ResultModel editResult = await _httpHelper.SendPutAsync<ResultModel>(
            $"{ConfigUrl}/EnvironmentServerAPI/ConfigurationItem/Edit",
            null,
            new
            {
                configItem.ID,
                model.Key,
                model.Value,
                model.Description
            });

        if (editResult.ResultType != ResultType.Success) throw new InvalidOperationException(editResult.Message);
    }
}
