/*
 * Generator Code From MateralMergeBlock=>GeneratorIControllerCodeAsync
 */
using MateralReleaseCenter.EnvironmentServer.Abstractions.DTO.ConfigurationItem;
using MateralReleaseCenter.EnvironmentServer.Abstractions.RequestModel.ConfigurationItem;

namespace MateralReleaseCenter.EnvironmentServer.Abstractions.Controllers
{
    /// <summary>
    /// 配置项控制器
    /// </summary>
    public partial interface IConfigurationItemController : IMergeBlockController<AddConfigurationItemRequestModel, EditConfigurationItemRequestModel, QueryConfigurationItemRequestModel, ConfigurationItemDTO, ConfigurationItemListDTO>
    {
    }
}
