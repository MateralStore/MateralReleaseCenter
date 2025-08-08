/*
 * Generator Code From MateralMergeBlock=>GeneratorControllersCodeAsync
 */
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.User;
using MateralReleaseCenter.ServerCenter.Abstractions.RequestModel.User;
using MateralReleaseCenter.ServerCenter.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.ServerCenter.Application.Controllers
{
    /// <summary>
    /// 用户控制器
    /// </summary>
    public partial class UserController : ServerCenterController<AddUserRequestModel, EditUserRequestModel, QueryUserRequestModel, AddUserModel, EditUserModel, QueryUserModel, UserDTO, UserListDTO, IUserService>, IUserController
    {
    }
}
