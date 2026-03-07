namespace Materal.MergeBlock.RemoteConfig;

/// <summary>
/// 远程配置选项
/// </summary>
public class RemoteConfigOptions
{
    /// <summary>
    /// 配置地址
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// 项目名称
    /// </summary>
    public string Project { get; set; } = string.Empty;

    /// <summary>
    /// 命名空间
    /// </summary>
    public string[] Namespace { get; set; } = [];
}
