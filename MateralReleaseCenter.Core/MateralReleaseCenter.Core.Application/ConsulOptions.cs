namespace MateralReleaseCenter.Core.Application;

/// <summary>
/// Consul配置
/// </summary>
[Options("Consul")]
public class ConsulOptions : IOptions
{
    /// <summary>
    /// 主机
    /// </summary>
    public string Host { get; set; } = "http://127.0.0.1:8500";
}
