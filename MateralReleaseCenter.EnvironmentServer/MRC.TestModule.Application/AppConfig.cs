namespace MRC.TestModule.Application;

/// <summary>
/// 应用程序配置
/// </summary>
[Options("TestModule")]
public class AppConfig : IOptions
{
    /// <summary>
    /// 测试值
    /// </summary>
    public string TestValue { get; set; } = string.Empty;
}
