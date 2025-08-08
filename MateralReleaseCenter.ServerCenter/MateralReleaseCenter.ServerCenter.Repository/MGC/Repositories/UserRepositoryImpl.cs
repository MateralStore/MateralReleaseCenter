/*
 * Generator Code From MateralMergeBlock=>GeneratorRepositoryImplCodeAsync
 */
namespace MateralReleaseCenter.ServerCenter.Repository.Repositories
{
    /// <summary>
    /// 用户仓储
    /// </summary>
    public partial class UserRepositoryImpl(ServerCenterDBContext dbContext) : ServerCenterRepositoryImpl<User>(dbContext), IUserRepository, IScopedDependency<IUserRepository>
    {
    }
}
