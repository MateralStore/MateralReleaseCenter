namespace MateralReleaseCenter.Authority.Abstractions
{
    /// <summary>
    /// Authority仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IAuthorityRepository<TDomain> : IMateralReleaseCenterRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}