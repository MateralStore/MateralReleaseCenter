namespace MateralReleaseCenter.ServerCenter.Abstractions
{
    /// <summary>
    /// ServerCenter仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IServerCenterRepository<TDomain> : IMateralReleaseCenterRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}