namespace MRC.TestModule.Application;

/// <summary>
/// 应用程序配置
/// </summary>

public class AppConfig
{
    /// <summary>
    /// 远程值
    /// </summary>
    public string RemoteValue { get; set; } = string.Empty;
    /// <summary>
    /// 测试值
    /// </summary>
    public string TestValue { get; set; } = string.Empty;

    /// <summary>
    /// Json值
    /// </summary>
    public JsonValueConfig JsonValue { get; set; } = new();

    /// <summary>
    /// 数字数组
    /// </summary>
    public int[] NumberValues { get; set; } = [];

    /// <summary>
    /// 对象数组
    /// </summary>
    public JsonSubConfig[] ObjectValues { get; set; } = [];
}
