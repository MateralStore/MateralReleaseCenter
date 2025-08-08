namespace MateralReleaseCenter.DeployServer.Repository
{
    /// <summary>
    /// DeployServer仓储实现
    /// </summary>
    /// <typeparam name="TDomain"></typeparam>
    public abstract class DeployServerRepositoryImpl<TDomain>(DeployServerDBContext dbContext) : MateralReleaseCenterRepositoryImpl<TDomain, DeployServerDBContext>(dbContext), IDeployServerRepository<TDomain>
        where TDomain : BaseDomain, IDomain, IEntity<Guid>, new()
    {
    }
}