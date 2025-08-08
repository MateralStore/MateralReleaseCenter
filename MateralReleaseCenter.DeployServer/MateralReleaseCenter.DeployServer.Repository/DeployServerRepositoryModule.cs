namespace MateralReleaseCenter.DeployServer.Repository
{
    /// <summary>
    /// DeployServer仓储模块
    /// </summary>
    public class DeployServerRepositoryModule() : MateralReleaseCenterRepositoryModule<DeployServerDBContext>("MateralReleaseCenter.DeployServer仓储模块")
    {
        /// <summary>
        /// 配置键
        /// </summary>
        protected override string ConfigKey => "DeployServer:DBConfig";
    }
}