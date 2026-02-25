using Materal.Utils.Caching;

namespace MateralReleaseCenter.Core.Repository;

/// <summary>
/// MateralReleaseCenter缓存仓储实现
/// </summary>
/// <typeparam name="TDomain"></typeparam>
/// <typeparam name="TDBContext"></typeparam>
public abstract class MateralReleaseCenterCacheRepositoryImpl<TDomain, TDBContext>(TDBContext dbContext, ICacheHelper cacheHelper) : SqliteCacheEFRepositoryImpl<TDomain, Guid, TDBContext>(dbContext, cacheHelper), IMateralReleaseCenterCacheRepository<TDomain>
    where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    where TDBContext : DbContext
{
}