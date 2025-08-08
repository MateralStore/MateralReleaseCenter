/*
 * Generator Code From MateralMergeBlock=>GeneratorControllerAccessorAsync
 */
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.Namespace;
using MateralReleaseCenter.ServerCenter.Abstractions.RequestModel.Namespace;

namespace MateralReleaseCenter.ServerCenter.Abstractions.ControllerAccessors
{
    /// <summary>
    /// 命名空间控制器访问器
    /// </summary>
    public partial class NamespaceControllerAccessor(IServiceProvider serviceProvider) : BaseControllerAccessor<INamespaceController, AddNamespaceRequestModel, EditNamespaceRequestModel, QueryNamespaceRequestModel, NamespaceDTO, NamespaceListDTO>(serviceProvider), INamespaceController
    {
        /// <summary>
        /// 项目名称
        /// </summary>
        public override string ProjectName => "MateralReleaseCenter";
        /// <summary>
        /// 模块名称
        /// </summary>
        public override string ModuleName => "ServerCenter";
    }
}
