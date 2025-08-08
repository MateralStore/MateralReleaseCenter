namespace MateralReleaseCenter.DeployServer.Abstractions
{
    /// <summary>
    /// DeployServer缓存仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IDeployServerCacheRepository<TDomain> : IMateralReleaseCenterCacheRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}