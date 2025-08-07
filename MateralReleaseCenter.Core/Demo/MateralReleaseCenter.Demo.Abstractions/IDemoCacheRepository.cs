namespace MateralReleaseCenter.Demo.Abstractions
{
    /// <summary>
    /// Demo缓存仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IDemoCacheRepository<TDomain> : IMateralReleaseCenterCacheRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}