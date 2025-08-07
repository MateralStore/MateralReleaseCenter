/*
 * Generator Code From MateralMergeBlock=>GeneratorServiceImplsCodeAsync
 */
using MateralReleaseCenter.Demo.Abstractions.DTO.User;
using MateralReleaseCenter.Demo.Abstractions.Services.Models.User;

namespace MateralReleaseCenter.Demo.Application.Services
{
    /// <summary>
    /// 用户服务
    /// </summary>
    public partial class UserServiceImpl : BaseServiceImpl<AddUserModel, EditUserModel, QueryUserModel, UserDTO, UserListDTO, IUserRepository, User, IDemoUnitOfWork>, IUserService, IScopedDependency<IUserService>
    {
    }
}
