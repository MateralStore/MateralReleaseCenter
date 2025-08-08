namespace MateralReleaseCenter.ServerCenter.Repository
{
    /// <summary>
    /// ServerCenter仓储模块
    /// </summary>
    public class ServerCenterRepositoryModule() : MateralReleaseCenterRepositoryModule<ServerCenterDBContext>("MateralReleaseCenter.ServerCenter仓储模块")
    {
        /// <summary>
        /// 配置键
        /// </summary>
        protected override string ConfigKey => "ServerCenter:DBConfig";
    }
}