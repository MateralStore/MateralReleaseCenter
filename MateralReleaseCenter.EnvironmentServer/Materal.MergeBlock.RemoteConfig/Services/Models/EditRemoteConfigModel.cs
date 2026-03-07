namespace Materal.MergeBlock.RemoteConfig.Services.Models;

/// <summary>
/// 修改远程配置模型
/// </summary>
public class EditRemoteConfigModel
{
    /// <summary>
    /// 配置键
    /// </summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// 配置值
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// 描述
    /// </summary>
    public string Description { get; set; } = string.Empty;
}
