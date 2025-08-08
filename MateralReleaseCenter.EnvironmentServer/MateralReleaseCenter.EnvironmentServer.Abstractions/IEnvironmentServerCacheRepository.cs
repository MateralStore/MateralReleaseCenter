namespace MateralReleaseCenter.EnvironmentServer.Abstractions
{
    /// <summary>
    /// EnvironmentServer缓存仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IEnvironmentServerCacheRepository<TDomain> : IMateralReleaseCenterCacheRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}