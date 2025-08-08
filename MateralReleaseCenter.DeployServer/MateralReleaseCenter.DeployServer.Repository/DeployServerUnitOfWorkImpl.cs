namespace MateralReleaseCenter.DeployServer.Repository
{
    /// <summary>
    /// DeployServer工作单元实现
    /// </summary>
    /// <param name="context"></param>
    /// <param name="serviceProvider"></param>
    public class DeployServerUnitOfWorkImpl(DeployServerDBContext context, IServiceProvider serviceProvider) : MateralReleaseCenterUnitOfWorkImpl<DeployServerDBContext>(context, serviceProvider), IDeployServerUnitOfWork, IScopedDependency<IDeployServerUnitOfWork>
    {
    }
}