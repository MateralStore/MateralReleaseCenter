namespace MateralReleaseCenter.DeployServer.Repository
{
    /// <summary>
    /// DeployServer缓存仓储实现
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public abstract class DeployServerCacheRepositoryImpl<TDomain>(DeployServerDBContext dbContext, ICacheHelper cacheHelper) : MateralReleaseCenterCacheRepositoryImpl<TDomain, DeployServerDBContext>(dbContext, cacheHelper), IDeployServerCacheRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}