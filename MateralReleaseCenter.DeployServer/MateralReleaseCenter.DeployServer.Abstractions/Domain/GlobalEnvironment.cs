namespace MateralReleaseCenter.DeployServer.Abstractions.Domain;

/// <summary>
/// 全局环境变量
/// </summary>
public class GlobalEnvironment : BaseDomain, IDomain
{
    /// <summary>
    /// 应用程序类型
    /// </summary>
    [Required(ErrorMessage = "应用程序类型为空")]
    [Equal]
    public ApplicationTypeEnum ApplicationType { get; set; }
    /// <summary>
    /// 键
    /// </summary>
    [Required(ErrorMessage = "键为空")]
    [Equal]
    public string Key { get; set; } = string.Empty;
    /// <summary>
    /// 值
    /// </summary>
    [NotQuery]
    [Required(ErrorMessage = "值为空")]
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// 描述
    /// </summary>
    public string? Description { get; set; }
}
