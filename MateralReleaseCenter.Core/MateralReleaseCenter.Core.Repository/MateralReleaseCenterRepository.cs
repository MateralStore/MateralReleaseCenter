namespace MateralReleaseCenter.Core.Repository
{
    /// <summary>
    /// MateralReleaseCenter仓储实现
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    /// <typeparam name="TDBContext"></typeparam>
    public abstract class MateralReleaseCenterRepositoryImpl<TDomain, TDBContext>(TDBContext dbContext) : SqliteEFRepositoryImpl<TDomain, Guid, TDBContext>(dbContext), IMateralReleaseCenterRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
        where TDBContext : DbContext
    {
    }
}