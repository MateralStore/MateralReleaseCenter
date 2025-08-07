namespace MateralReleaseCenter.Core.Abstractions
{
    /// <summary>
    /// MateralReleaseCenter缓存仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IMateralReleaseCenterCacheRepository<TDomain> : ICacheEFRepository<TDomain, Guid>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}