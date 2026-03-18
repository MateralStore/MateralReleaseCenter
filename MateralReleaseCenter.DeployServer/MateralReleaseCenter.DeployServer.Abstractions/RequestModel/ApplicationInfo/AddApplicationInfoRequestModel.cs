namespace MateralReleaseCenter.DeployServer.Abstractions.RequestModel.ApplicationInfo;
/// <summary>
/// 应用程序信息添加模型
/// </summary>
public partial class AddApplicationInfoRequestModel
{
    /// <summary>
    /// 环境变量
    /// </summary>
    public List<EnvironmentRequestModel> Environments { get; set; } = [];
}
