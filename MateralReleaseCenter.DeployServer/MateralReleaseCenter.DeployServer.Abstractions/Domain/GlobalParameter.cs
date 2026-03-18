namespace MateralReleaseCenter.DeployServer.Abstractions.Domain;

/// <summary>
/// 全局参数
/// </summary>
public class GlobalParameter : BaseDomain, IDomain
{
    /// <summary>
    /// 应用程序类型
    /// </summary>
    [Required(ErrorMessage = "应用程序类型为空")]
    [Equal]
    public ApplicationTypeEnum ApplicationType { get; set; }
    /// <summary>
    /// 名称
    /// </summary>
    [Required(ErrorMessage = "名称为空")]
    [Equal]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// 值
    /// </summary>
    [NotQuery]
    [Required(ErrorMessage = "值为空")]
    public string Value { get; set; } = string.Empty;
}
