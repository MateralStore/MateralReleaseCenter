/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.DeployServer.Abstractions.DTO.DefaultData;
using MateralReleaseCenter.DeployServer.Abstractions.Services.Models.DefaultData;

namespace MateralReleaseCenter.DeployServer.Application.Services
{
    /// <summary>
    /// 默认数据服务
    /// </summary>
    public partial class DefaultDataServiceImpl : BaseServiceImpl<AddDefaultDataModel, EditDefaultDataModel, QueryDefaultDataModel, DefaultDataDTO, DefaultDataListDTO, IDefaultDataRepository, DefaultData, IDeployServerUnitOfWork>, IDefaultDataService, IScopedDependency<IDefaultDataService>
    {
    }
}
