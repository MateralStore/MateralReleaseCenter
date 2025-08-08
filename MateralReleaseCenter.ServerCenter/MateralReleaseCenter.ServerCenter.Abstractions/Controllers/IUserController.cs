using MateralReleaseCenter.ServerCenter.Abstractions.DTO.User;
using MateralReleaseCenter.ServerCenter.Abstractions.RequestModel.User;

namespace MateralReleaseCenter.ServerCenter.Abstractions.Controllers;

/// <summary>
/// 用户服务控制器
/// </summary>
public partial interface IUserController
{
    /// <summary>
    /// 获得登录用户信息
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    Task<ResultModel<UserDTO>> GetLoginUserInfoAsync();
    /// <summary>
    /// 登录
    /// </summary>
    /// <param name="requestModel"></param>
    /// <returns></returns>
    [HttpPost, AllowAnonymous]
    Task<ResultModel<LoginResultDTO>> LoginAsync(LoginRequestModel requestModel);
}
