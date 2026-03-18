namespace MateralReleaseCenter.DeployServer.Abstractions.DTO.GlobalParameter;

public partial class GlobalParameterListDTO
{
    /// <summary>
    /// 应用程序类型文本
    /// </summary>
    [Required(ErrorMessage = "应用程序类型为空")]
    public string ApplicationTypeText => ApplicationType.GetDescription();
}
