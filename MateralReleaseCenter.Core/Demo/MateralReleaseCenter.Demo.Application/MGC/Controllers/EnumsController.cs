/*
 * Generator Code From MateralMergeBlock=>GeneratorEnumControllerAsync
 */
using Microsoft.AspNetCore.Authorization;
using MateralReleaseCenter.Demo.Abstractions.Enums;

namespace MateralReleaseCenter.Demo.Abstractions.HttpClient
{
    /// <summary>
    /// 枚举控制器
    /// </summary>
    [AllowAnonymous]
    public partial class EnumsController : DemoController
    {
        /// <summary>
        /// 获取所有性别枚举
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ResultModel<List<KeyValueModel<SexEnum>>> GetAllSexEnum()
        {
            List<KeyValueModel<SexEnum>> result = KeyValueModel<SexEnum>.GetAllCode();
            return ResultModel<List<KeyValueModel<SexEnum>>>.Success(result, "获取成功");
        }
    }
}
