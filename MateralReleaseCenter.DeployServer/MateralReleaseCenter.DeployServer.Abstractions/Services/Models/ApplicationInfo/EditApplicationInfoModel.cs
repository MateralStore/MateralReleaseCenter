namespace MateralReleaseCenter.DeployServer.Abstractions.Services.Models.ApplicationInfo;
/// <summary>
/// 应用程序信息修改模型
/// </summary>
public partial class EditApplicationInfoModel : IEditServiceModel
{
    /// <summary>
    /// 环境变量
    /// </summary>
    public List<EnvironmentModel> Environments { get; set; } = [];
}
