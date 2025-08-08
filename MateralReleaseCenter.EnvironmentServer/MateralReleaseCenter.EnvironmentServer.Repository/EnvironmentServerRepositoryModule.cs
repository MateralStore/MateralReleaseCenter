namespace MateralReleaseCenter.EnvironmentServer.Repository
{
    /// <summary>
    /// EnvironmentServer仓储模块
    /// </summary>
    public class EnvironmentServerRepositoryModule() : MateralReleaseCenterRepositoryModule<EnvironmentServerDBContext>("MateralReleaseCenter.EnvironmentServer仓储模块")
    {
        /// <summary>
        /// 配置键
        /// </summary>
        protected override string ConfigKey => "EnvironmentServer:DBConfig";
    }
}