/*
 * Generator Code From MateralMergeBlock=>GeneratorControllerAccessorAsync
 */
using MateralReleaseCenter.DeployServer.Abstractions.DTO.DefaultData;
using MateralReleaseCenter.DeployServer.Abstractions.RequestModel.DefaultData;

namespace MateralReleaseCenter.DeployServer.Abstractions.ControllerAccessors
{
    /// <summary>
    /// 默认数据控制器访问器
    /// </summary>
    public partial class DefaultDataControllerAccessor(IServiceProvider serviceProvider) : BaseControllerAccessor<IDefaultDataController, AddDefaultDataRequestModel, EditDefaultDataRequestModel, QueryDefaultDataRequestModel, DefaultDataDTO, DefaultDataListDTO>(serviceProvider), IDefaultDataController
    {
        /// <summary>
        /// 项目名称
        /// </summary>
        public override string ProjectName => "MateralReleaseCenter";
        /// <summary>
        /// 模块名称
        /// </summary>
        public override string ModuleName => "DeployServer";
    }
}
