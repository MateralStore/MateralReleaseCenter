/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.DeployServer.Abstractions.DTO.ApplicationInfo;
using MateralReleaseCenter.DeployServer.Abstractions.Services.Models.ApplicationInfo;

namespace MateralReleaseCenter.DeployServer.Application.Services
{
    /// <summary>
    /// 应用程序信息服务
    /// </summary>
    public partial class ApplicationInfoServiceImpl : BaseServiceImpl<AddApplicationInfoModel, EditApplicationInfoModel, QueryApplicationInfoModel, ApplicationInfoDTO, ApplicationInfoListDTO, IApplicationInfoRepository, ApplicationInfo, IDeployServerUnitOfWork>, IApplicationInfoService, IScopedDependency<IApplicationInfoService>
    {
    }
}
