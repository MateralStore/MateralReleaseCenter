/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.User;
using MateralReleaseCenter.ServerCenter.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.ServerCenter.Application.Services
{
    /// <summary>
    /// 用户服务
    /// </summary>
    public partial class UserServiceImpl : BaseServiceImpl<AddUserModel, EditUserModel, QueryUserModel, UserDTO, UserListDTO, IUserRepository, User, IServerCenterUnitOfWork>, IUserService, IScopedDependency<IUserService>
    {
    }
}
