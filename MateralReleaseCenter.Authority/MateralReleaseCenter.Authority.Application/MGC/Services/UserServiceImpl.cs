/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.Authority.Abstractions.DTO.User;
using MateralReleaseCenter.Authority.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.Authority.Application.Services
{
    /// <summary>
    /// 用户服务
    /// </summary>
    public partial class UserServiceImpl : BaseServiceImpl<AddUserModel, EditUserModel, QueryUserModel, UserDTO, UserListDTO, IUserRepository, User, IAuthorityUnitOfWork>, IUserService, IScopedDependency<IUserService>
    {
    }
}
