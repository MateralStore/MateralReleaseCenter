using Materal.MergeBlock.Authorization.Abstractions;
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.User;
using MateralReleaseCenter.ServerCenter.Abstractions.RequestModel.User;
using MateralReleaseCenter.ServerCenter.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.ServerCenter.Application.Controllers;

/// <summary>
/// 用户服务控制器
/// </summary>
public partial class UserController(ITokenService tokenService, IOptionsMonitor<Materal.MergeBlock.Authorization.Abstractions.AuthorizationOptions> config)
{
    /// <summary>
    /// 获得登录用户信息
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public async Task<ResultModel<UserDTO>> GetLoginUserInfoAsync()
    {
        Guid id = this.GetLoginUserID();
        UserDTO result = await DefaultService.GetInfoAsync(id);
        return ResultModel<UserDTO>.Success(result, "查询成功");
    }
    /// <summary>
    /// 登录
    /// </summary>
    /// <param name="requestModel"></param>
    /// <returns></returns>
    [HttpPost, AllowAnonymous]
    public async Task<ResultModel<LoginResultDTO>> LoginAsync(LoginRequestModel requestModel)
    {
        try
        {
            LoginModel model = Mapper.Map<LoginModel>(requestModel) ?? throw new MateralReleaseCenterException("映射失败"); ;
            UserDTO userInfo = await DefaultService.LoginAsync(model);
            LoginResultDTO result = new()
            {
                Token = tokenService.GetToken(userInfo.ID),
                ExpiredTime = config.CurrentValue.ExpiredTime
            };
            return ResultModel<LoginResultDTO>.Success(result, "登录成功");
        }
        catch (MateralReleaseCenterException ex)
        {
            throw new MateralReleaseCenterException("账号或密码错误", ex);
        }
    }
}
