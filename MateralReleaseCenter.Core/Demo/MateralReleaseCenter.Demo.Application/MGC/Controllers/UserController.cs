/*
 * Generator Code From MateralMergeBlock=>GeneratorControllersCodeAsync
 */
using MateralReleaseCenter.Demo.Abstractions.DTO.User;
using MateralReleaseCenter.Demo.Abstractions.RequestModel.User;
using MateralReleaseCenter.Demo.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.Demo.Application.Controllers
{
    /// <summary>
    /// 用户控制器
    /// </summary>
    public partial class UserController : DemoController<AddUserRequestModel, EditUserRequestModel, QueryUserRequestModel, AddUserModel, EditUserModel, QueryUserModel, UserDTO, UserListDTO, IUserService>, IUserController
    {
    }
}
