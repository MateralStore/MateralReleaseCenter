namespace MateralReleaseCenter.Core.Repository
{
    /// <summary>
    /// MateralReleaseCenter工作单元实现
    /// </summary>
    /// <param name="context"></param>
    /// <param name="serviceProvider"></param>
    public class MateralReleaseCenterUnitOfWorkImpl<T>(T context, IServiceProvider serviceProvider) : MergeBlockUnitOfWorkImpl<T>(context, serviceProvider), IMateralReleaseCenterUnitOfWork
        where T : DbContext
    {
    }
}