/*
 * Generator Code From MateralMergeBlock=>GeneratorControllersCodeAsync
 */
using MateralReleaseCenter.DeployServer.Abstractions.DTO.ApplicationInfo;
using MateralReleaseCenter.DeployServer.Abstractions.RequestModel.ApplicationInfo;
using MateralReleaseCenter.DeployServer.Abstractions.Services.Models.ApplicationInfo;

namespace MateralReleaseCenter.DeployServer.Application.Controllers
{
    /// <summary>
    /// 应用程序信息控制器
    /// </summary>
    public partial class ApplicationInfoController : DeployServerController<AddApplicationInfoRequestModel, EditApplicationInfoRequestModel, QueryApplicationInfoRequestModel, AddApplicationInfoModel, EditApplicationInfoModel, QueryApplicationInfoModel, ApplicationInfoDTO, ApplicationInfoListDTO, IApplicationInfoService>, IApplicationInfoController
    {
    }
}
