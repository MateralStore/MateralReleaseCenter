namespace MateralReleaseCenter.ServerCenter.Application
{
    /// <summary>
    /// 应用程序配置
    /// </summary>
    [Options("ServerCenter")]
    public class ApplicationConfig : IOptions
    {
        /// <summary>
        /// 默认密码
        /// </summary>
        public string DefaultPassword { get; set; } = "123456";
    }
}