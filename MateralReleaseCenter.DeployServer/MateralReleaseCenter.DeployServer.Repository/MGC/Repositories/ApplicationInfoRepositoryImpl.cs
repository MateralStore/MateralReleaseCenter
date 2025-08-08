/*
 * Generator Code From MateralMergeBlock=>GeneratorRepositoryImplCodeAsync
 */
namespace MateralReleaseCenter.DeployServer.Repository.Repositories
{
    /// <summary>
    /// 应用程序信息仓储
    /// </summary>
    public partial class ApplicationInfoRepositoryImpl(DeployServerDBContext dbContext) : DeployServerRepositoryImpl<ApplicationInfo>(dbContext), IApplicationInfoRepository, IScopedDependency<IApplicationInfoRepository>
    {
    }
}
