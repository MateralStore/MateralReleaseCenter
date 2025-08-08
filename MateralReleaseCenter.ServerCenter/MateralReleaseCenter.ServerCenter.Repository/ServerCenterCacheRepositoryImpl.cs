namespace MateralReleaseCenter.ServerCenter.Repository
{
    /// <summary>
    /// ServerCenter缓存仓储实现
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public abstract class ServerCenterCacheRepositoryImpl<TDomain>(ServerCenterDBContext dbContext, ICacheHelper cacheHelper) : MateralReleaseCenterCacheRepositoryImpl<TDomain, ServerCenterDBContext>(dbContext, cacheHelper), IServerCenterCacheRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}