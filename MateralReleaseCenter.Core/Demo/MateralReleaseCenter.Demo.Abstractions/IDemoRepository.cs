namespace MateralReleaseCenter.Demo.Abstractions
{
    /// <summary>
    /// Demo仓储接口
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public interface IDemoRepository<TDomain> : IMateralReleaseCenterRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}