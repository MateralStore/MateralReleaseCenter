namespace MateralReleaseCenter.ServerCenter.Application
{
    /// <summary>
    /// 应用程序配置
    /// </summary>
    [Options("ServerCenter")]
    public class ApplicationConfig : IOptions
    {
        /// <summary>
        /// 网关地址
        /// </summary>
        public string GatewayUrl { get; set; } = "http://127.0.0.1:8700";
        /// <summary>
        /// 默认密码
        /// </summary>
        public string DefaultPassword { get; set; } = "123456";
    }
}