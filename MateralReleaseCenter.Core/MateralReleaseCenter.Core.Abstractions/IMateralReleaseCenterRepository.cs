namespace MateralReleaseCenter.Core.Abstractions
{
    /// <summary>
    /// MateralReleaseCenter仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IMateralReleaseCenterRepository<TDomain> : IEFRepository<TDomain, Guid>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}