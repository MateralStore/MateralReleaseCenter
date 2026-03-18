namespace MateralReleaseCenter.DeployServer.Abstractions.Services.Models.ApplicationInfo;
/// <summary>
/// 应用程序信息添加模型
/// </summary>
public partial class AddApplicationInfoModel : IAddServiceModel
{
    /// <summary>
    /// 环境变量
    /// </summary>
    public List<EnvironmentModel> Environments { get; set; } = [];
}
