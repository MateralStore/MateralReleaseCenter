using Materal.Utils.Enums;
using Materal.Utils.Extensions;
using Materal.Utils.Models;
using Materal.Utils.Network.Http;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Nodes;

namespace MRC.ConfigClient;

/// <summary>
/// 配置供应器
/// </summary>
public class MRCConfigurationProvider(MRCConfigurationSource source) : ConfigurationProvider
{
    private IHttpHelper _httpHelper = new HttpHelper();

    /// <inheritdoc/>
    public override void Load()
    {
        Task loadTask = Task.Run(LoadConfigItemsAsync);
        loadTask.Wait();
    }

    private async Task LoadConfigItemsAsync()
    {
        CollectionResultModel<ConfigItem> dataResult = await _httpHelper.SendPostAsync<CollectionResultModel<ConfigItem>>($"{source.Url}/EnvironmentServerAPI/ConfigurationItem/GetList", null, new
        {
            PageIndex = 1,
            PageSize = int.MaxValue,
            ProjectName = source.Project,
            NamespaceNames = source.Namespaces,
        });
        if (dataResult.ResultType != ResultType.Success || dataResult.Data is null || dataResult.Data.Count == 0) return;
        Data = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (ConfigItem item in dataResult.Data)
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
    private class ConfigItem
    {
        /// <summary>
        /// 唯一标识
        /// </summary>
        public Guid ID { get; set; }
        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreateTime { get; set; }
        /// <summary>
        /// 项目唯一标识
        /// </summary>
        public Guid ProjectID { get; set; }
        /// <summary>
        /// 项目名称
        /// </summary>
        public string ProjectName { get; set; } = string.Empty;
        /// <summary>
        /// 命名空间唯一标识
        /// </summary>
        public Guid NamespaceID { get; set; }
        /// <summary>
        /// 命名空间名称
        /// </summary>
        public string NamespaceName { get; set; } = string.Empty;
        /// <summary>
        /// 键
        /// </summary>
        public string Key { get; set; } = string.Empty;
        /// <summary>
        /// 值
        /// </summary>
        public string Value { get; set; } = string.Empty;
        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; } = string.Empty;
    }
}
