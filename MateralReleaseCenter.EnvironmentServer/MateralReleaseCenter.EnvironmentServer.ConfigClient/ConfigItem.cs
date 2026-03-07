namespace MateralReleaseCenter.EnvironmentServer.ConfigClient;

/// <summary>
/// 配置项
/// </summary>
public class ConfigItem
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
