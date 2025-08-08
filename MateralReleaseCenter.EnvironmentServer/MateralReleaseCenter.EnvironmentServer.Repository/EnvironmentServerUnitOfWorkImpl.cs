namespace MateralReleaseCenter.EnvironmentServer.Repository
{
    /// <summary>
    /// EnvironmentServer工作单元实现
    /// </summary>
    /// <param name="context"></param>
    /// <param name="serviceProvider"></param>
    public class EnvironmentServerUnitOfWorkImpl(EnvironmentServerDBContext context, IServiceProvider serviceProvider) : MateralReleaseCenterUnitOfWorkImpl<EnvironmentServerDBContext>(context, serviceProvider), IEnvironmentServerUnitOfWork, IScopedDependency<IEnvironmentServerUnitOfWork>
    {
    }
}