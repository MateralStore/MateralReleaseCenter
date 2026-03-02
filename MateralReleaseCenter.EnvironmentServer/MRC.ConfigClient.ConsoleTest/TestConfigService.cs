using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace MRC.ConfigClient.ConsoleTest;

/// <summary>
/// 测试配置服务
/// </summary>
/// <param name="appConfig"></param>
public class TestConfigService(IOptionsMonitor<AppConfig> appConfig) : IHostedService
{
    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] 配置更新");
            Console.WriteLine($"  {nameof(AppConfig.LocalValue)}: {appConfig.CurrentValue.LocalValue}");
            Console.WriteLine($"  {nameof(AppConfig.RemoteValue)}: {appConfig.CurrentValue.RemoteValue}");
            Console.WriteLine($"  {nameof(AppConfig.TestValue)}: {appConfig.CurrentValue.TestValue}");
            Console.WriteLine($"  {nameof(AppConfig.JsonValue)}:");
            Console.WriteLine($"    Name: {appConfig.CurrentValue.JsonValue.Name}");
            Console.WriteLine($"    Value: {appConfig.CurrentValue.JsonValue.Value}");
            Console.WriteLine($"    NumberValues: [{string.Join(", ", appConfig.CurrentValue.JsonValue.NumberValues)}]");
            Console.WriteLine($"    ObjectValues:");
            for (int i = 0; i < appConfig.CurrentValue.JsonValue.ObjectValues.Length; i++)
            {
                JsonSubConfig obj = appConfig.CurrentValue.JsonValue.ObjectValues[i];
                Console.WriteLine($"      [{i}] Name={obj.Name}, Value={obj.Value}");
            }
            Console.WriteLine($"  {nameof(AppConfig.NumberValues)}: [{string.Join(", ", appConfig.CurrentValue.NumberValues)}]");
            Console.WriteLine($"  {nameof(AppConfig.ObjectValues)}:");
            for (int i = 0; i < appConfig.CurrentValue.ObjectValues.Length; i++)
            {
                JsonSubConfig obj = appConfig.CurrentValue.ObjectValues[i];
                Console.WriteLine($"    [{i}] Name={obj.Name}, Value={obj.Value}");
            }
            Console.WriteLine();
            await Task.Delay(1000);
        }
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.CompletedTask;
    }
}
