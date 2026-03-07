using Materal.MergeBlock.RemoteConfig.Services.DTO;
using Materal.MergeBlock.RemoteConfig.Services.Models;

namespace Materal.MergeBlock.RemoteConfig.Services;

/// <summary>
/// 远程配置服务
/// </summary>
public interface IRemoteConfigService
{
    /// <summary>
    /// 获取配置项
    /// </summary>
    /// <param name="key">配置键</param>
    /// <returns>配置项信息，不存在返回 null</returns>
    Task<RemoteConfigDTO?> GetConfigAsync(string key);

    /// <summary>
    /// 获取全部配置列表
    /// </summary>
    /// <returns>配置列表</returns>
    Task<List<RemoteConfigDTO>> GetListAsync();

    /// <summary>
    /// 修改配置项
    /// </summary>
    /// <param name="model">修改配置模型</param>
    Task EditConfigAsync(EditRemoteConfigModel model);
}
