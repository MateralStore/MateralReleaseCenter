namespace Materal.MergeBlock.RemoteConfig.Services.DTO;

/// <summary>
/// 远程配置DTO
/// </summary>
public class RemoteConfigDTO
{
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
    public string? Description { get; set; }
}
