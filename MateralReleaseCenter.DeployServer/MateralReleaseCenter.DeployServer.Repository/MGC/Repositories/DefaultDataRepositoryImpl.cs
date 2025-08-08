/*
 * Generator Code From MateralMergeBlock=>GeneratorRepositoryImplCodeAsync
 */
namespace MateralReleaseCenter.DeployServer.Repository.Repositories
{
    /// <summary>
    /// 默认数据仓储
    /// </summary>
    public partial class DefaultDataRepositoryImpl(DeployServerDBContext dbContext) : DeployServerRepositoryImpl<DefaultData>(dbContext), IDefaultDataRepository, IScopedDependency<IDefaultDataRepository>
    {
    }
}
