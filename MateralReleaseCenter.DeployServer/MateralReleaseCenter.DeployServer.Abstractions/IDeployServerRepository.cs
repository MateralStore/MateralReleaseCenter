namespace MateralReleaseCenter.DeployServer.Abstractions
{
    /// <summary>
    /// DeployServer仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IDeployServerRepository<TDomain> : IMateralReleaseCenterRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}