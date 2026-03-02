namespace MRC.ConfigClient.ConsoleTest;

/// <summary>
/// Json值
/// </summary>
public class JsonValueConfig
{
    /// <summary>
    /// 名字
    /// </summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// 值
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// 数字数组
    /// </summary>
    public int[] NumberValues { get; set; } = [];

    /// <summary>
    /// 对象数组
    /// </summary>
    public JsonSubConfig[] ObjectValues { get; set; } = [];
}
