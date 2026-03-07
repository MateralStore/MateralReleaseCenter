using MateralReleaseCenter.EnvironmentServer.Abstractions.DTO.ConfigurationItem;
using MateralReleaseCenter.EnvironmentServer.Abstractions.RequestModel.ConfigurationItem;

namespace MateralReleaseCenter.EnvironmentServer.Application.Controllers
{
    /// <summary>
    /// 配置项控制器
    /// </summary>
    public partial class ConfigurationItemController
    {
        /// <summary>
        /// 获得列表信息
        /// </summary>
        /// <param name="requestModel"></param>
        /// <returns></returns>
        [AllowAnonymous]
        public override Task<CollectionResultModel<ConfigurationItemListDTO>> GetListAsync(QueryConfigurationItemRequestModel requestModel)
            => base.GetListAsync(requestModel);

        /// <inheritdoc/>
        [AllowAnonymous]
        public override Task<ResultModel> EditAsync(EditConfigurationItemRequestModel requestModel) => base.EditAsync(requestModel);
    }
}
