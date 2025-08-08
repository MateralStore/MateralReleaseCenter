namespace MateralReleaseCenter.Authority.Repository
{
    /// <summary>
    /// Authority仓储模块
    /// </summary>
    public class AuthorityRepositoryModule() : MateralReleaseCenterRepositoryModule<AuthorityDBContext>("MateralReleaseCenter.Authority仓储模块")
    {
        /// <summary>
        /// 配置键
        /// </summary>
        protected override string ConfigKey => "Authority:DBConfig";
    }
}