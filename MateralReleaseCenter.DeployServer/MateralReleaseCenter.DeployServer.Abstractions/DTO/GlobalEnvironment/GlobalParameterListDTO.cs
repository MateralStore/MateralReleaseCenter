namespace MateralReleaseCenter.DeployServer.Abstractions.DTO.GlobalEnvironment;

public partial class GlobalEnvironmentListDTO
{
    /// <summary>
    /// 应用程序类型文本
    /// </summary>
    [Required(ErrorMessage = "应用程序类型为空")]
    public string ApplicationTypeText => ApplicationType.GetDescription();
}
