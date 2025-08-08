/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.EnvironmentServer.Abstractions.DTO.ConfigurationItem;
using MateralReleaseCenter.EnvironmentServer.Abstractions.Services.Models.ConfigurationItem;

namespace MateralReleaseCenter.EnvironmentServer.Application.Services
{
    /// <summary>
    /// 配置项服务
    /// </summary>
    public partial class ConfigurationItemServiceImpl : BaseServiceImpl<AddConfigurationItemModel, EditConfigurationItemModel, QueryConfigurationItemModel, ConfigurationItemDTO, ConfigurationItemListDTO, IConfigurationItemRepository, ConfigurationItem, IEnvironmentServerUnitOfWork>, IConfigurationItemService, IScopedDependency<IConfigurationItemService>
    {
    }
}
