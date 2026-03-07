using Materal.Utils.Enums;
using Materal.Utils.Extensions;
using Materal.Utils.Models;
using Materal.Utils.Network.Http;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

namespace MateralReleaseCenter.EnvironmentServer.ConfigClient;

/// <summary>
/// 配置供应器
/// </summary>
public class MRCConfigurationProvider(MRCConfigurationSource source) : ConfigurationProvider, IDisposable
{
    private readonly HttpHelper _httpHelper = new();
    private Timer? _timer;
    private string? _lastConfigHash;
    /// <summary>
    /// 加载配置前
    /// </summary>
    public static event Action<MRCConfigurationSource, IDictionary<string, string?>>? OnLoadConfigBefor;
    /// <summary>
    /// 加载配置后
    /// </summary>
    public static event Action<MRCConfigurationSource, IDictionary<string, string?>, CollectionResultModel<ConfigItem>>? OnLoadConfigAfter;

    /// <inheritdoc/>
    public override void Load()
    {
        Task loadTask = Task.Run(LoadConfigItemsAsync);
        loadTask.Wait();
        StartPolling();
    }

    private void StartPolling()
        => _timer = new Timer(async _ => await CheckAndReloadAsync(), null, source.ReloadInterval, source.ReloadInterval);

    private async Task CheckAndReloadAsync()
    {
        try
        {
            CollectionResultModel<ConfigItem> dataResult = await _httpHelper.SendPostAsync<CollectionResultModel<ConfigItem>>($"{source.Url}/EnvironmentServerAPI/ConfigurationItem/GetList", null, new
            {
                PageIndex = 1,
                PageSize = int.MaxValue,
                ProjectName = source.Project,
                NamespaceNames = source.Namespaces,
            });
            if (dataResult.ResultType != ResultType.Success || dataResult.Data is null || dataResult.Data.Count == 0) return;

            string currentHash = ComputeConfigHash(dataResult.Data);
            if (currentHash != _lastConfigHash)
            {
                _lastConfigHash = currentHash;
                LoadConfigItems(dataResult.Data);
                OnReload();
            }
        }
        catch
        {
            // 忽略轮询过程中的异常，避免影响应用程序
        }
    }

    private string ComputeConfigHash(ICollection<ConfigItem> configItems)
    {
        StringBuilder sb = new();
        foreach (ConfigItem? item in configItems.OrderBy(x => x.Key))
        {
            sb.Append(item.Key);
            sb.Append(item.Value);
        }
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(sb.ToString()));
        return Convert.ToHexString(bytes);
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        _timer?.Dispose();
        GC.SuppressFinalize(this);
    }

    private async Task LoadConfigItemsAsync()
    {
        OnLoadConfigBefor?.Invoke(source, Data);
        CollectionResultModel<ConfigItem> dataResult = await _httpHelper.SendPostAsync<CollectionResultModel<ConfigItem>>($"{source.Url}/EnvironmentServerAPI/ConfigurationItem/GetList", null, new
        {
            PageIndex = 1,
            PageSize = int.MaxValue,
            ProjectName = source.Project,
            NamespaceNames = source.Namespaces,
        });
        if (dataResult.ResultType != ResultType.Success || dataResult.Data is null || dataResult.Data.Count == 0) return;
        LoadConfigItems(dataResult.Data);
        OnLoadConfigAfter?.Invoke(source, Data, dataResult);
    }

    private void LoadConfigItems(ICollection<ConfigItem> configItems)
    {
        Data = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (ConfigItem item in configItems)
        {
            if (item.Value.IsJson())
            {
                JsonNode? jsonNode = JsonNode.Parse(item.Value);
                if (jsonNode is null) continue;
                AddJson(item.Key, jsonNode);
            }
            else
            {
                Data.TryAdd(item.Key, item.Value);
            }
        }
    }
    /// <summary>
    /// 添加Json
    /// </summary>
    /// <param name="key"></param>
    /// <param name="value"></param>
    private void AddJson(string key, JsonNode value)
    {
        if (value is JsonObject jsonObject)
        {
            AddJsonObject(key, jsonObject);
        }
        else if (value is JsonArray jsonArray)
        {
            AddJsonArray(key, jsonArray);
        }
    }
    /// <summary>
    /// 添加Json对象
    /// </summary>
    /// <param name="key"></param>
    /// <param name="value"></param>
    private void AddJsonObject(string key, JsonObject value)
    {
        foreach (KeyValuePair<string, JsonNode?> item in value)
        {
            if (item.Value is null) continue;
            string itemKey = $"{key}:{item.Key}";
            if (item.Value is JsonValue jsonValue)
            {
                Data.TryAdd(itemKey, jsonValue.ToString());
            }
            else
            {
                AddJson(itemKey, item.Value);
            }
        }
    }
    /// <summary>
    /// 添加Json数组
    /// </summary>
    /// <param name="key"></param>
    /// <param name="value"></param>
    private void AddJsonArray(string key, JsonArray value)
    {
        for (int i = 0; i < value.Count; i++)
        {
            JsonNode? item = value[i];
            if (item is null) continue;
            string itemKey = string.IsNullOrEmpty(key) ? $"{i}" : $"{key}:{i}";
            if (item is JsonValue jsonValue)
            {
                Data.TryAdd(itemKey, jsonValue.ToString());
            }
            else
            {
                AddJson(itemKey, item);
            }
        }
    }
}
