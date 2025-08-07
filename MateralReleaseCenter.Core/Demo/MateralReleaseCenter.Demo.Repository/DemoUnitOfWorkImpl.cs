namespace MateralReleaseCenter.Demo.Repository
{
    /// <summary>
    /// Demo工作单元实现
    /// </summary>
    /// <param name="context"></param>
    /// <param name="serviceProvider"></param>
    public class DemoUnitOfWorkImpl(DemoDBContext context, IServiceProvider serviceProvider) : MateralReleaseCenterUnitOfWorkImpl<DemoDBContext>(context, serviceProvider), IDemoUnitOfWork, IScopedDependency<IDemoUnitOfWork>
    {
    }
}