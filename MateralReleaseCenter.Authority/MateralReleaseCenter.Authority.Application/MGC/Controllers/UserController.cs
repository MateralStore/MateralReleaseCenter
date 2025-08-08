/*
 * Generator Code From MateralMergeBlock=>GeneratorControllersCodeAsync
 */
using MateralReleaseCenter.Authority.Abstractions.DTO.User;
using MateralReleaseCenter.Authority.Abstractions.RequestModel.User;
using MateralReleaseCenter.Authority.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.Authority.Application.Controllers
{
    /// <summary>
    /// 用户控制器
    /// </summary>
    public partial class UserController : AuthorityController<AddUserRequestModel, EditUserRequestModel, QueryUserRequestModel, AddUserModel, EditUserModel, QueryUserModel, UserDTO, UserListDTO, IUserService>, IUserController
    {
    }
}
