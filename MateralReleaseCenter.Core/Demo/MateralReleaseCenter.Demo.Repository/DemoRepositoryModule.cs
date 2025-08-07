namespace MateralReleaseCenter.Demo.Repository
{
    /// <summary>
    /// Demo仓储模块
    /// </summary>
    public class DemoRepositoryModule() : MateralReleaseCenterRepositoryModule<DemoDBContext>("MateralReleaseCenter.Demo仓储模块")
    {
        /// <summary>
        /// 配置键
        /// </summary>
        protected override string ConfigKey => "Demo:DBConfig";
    }
}