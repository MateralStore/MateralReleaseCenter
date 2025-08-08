using MateralReleaseCenter.EnvironmentServer.Abstractions.RequestModel.ConfigurationItem;

namespace MateralReleaseCenter.EnvironmentServer.Abstractions.Controllers
{
    /// <summary>
    /// 控制器
    /// </summary>
    public partial interface IConfigurationItemController : IMergeBlockController
    {
        /// <summary>
        /// 同步配置
        /// </summary>
        /// <param name="requestModel"></param>
        /// <returns></returns>
        [HttpPut]
        Task<ResultModel> SyncConfigAsync(SyncConfigRequestModel requestModel);
    }
}
