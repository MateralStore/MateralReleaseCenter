namespace MateralReleaseCenter.Authority.Repository
{
    /// <summary>
    /// Authority仓储实现
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public abstract class AuthorityRepositoryImpl<TDomain>(AuthorityDBContext dbContext) : MateralReleaseCenterRepositoryImpl<TDomain, AuthorityDBContext>(dbContext), IAuthorityRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}