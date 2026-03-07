using Materal.MergeBlock.RemoteConfig.Services;
using Materal.MergeBlock.RemoteConfig.Services.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MRC.TestModule.Application;

/// <summary>
/// 测试服务
/// </summary>
public class TestService(IOptionsMonitor<AppConfig> config, ILogger<TestService> logger, IRemoteConfigService remoteConfigService) : IHostedService, IDisposable
{
    /// <summary>
    /// 定时器
    /// </summary>
    private Timer? _timer;

    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _timer = new Timer(
            _ => logger.LogInformation("TestValue: {TestValue}", config.CurrentValue.TestValue),
            null,
            TimeSpan.Zero,
            TimeSpan.FromSeconds(1));

        // 5秒后修改TestValue为随机GUID
        _ = Task.Run(async () =>
        {
            await Task.Delay(5000, cancellationToken);
            EditRemoteConfigModel model = new()
            {
                Key = "TestModule:TestValue",
                Value = Guid.NewGuid().ToString(),
                Description = "自动生成的随机GUID"
            };
            await remoteConfigService.EditConfigAsync(model);
            logger.LogInformation("TestValue已修改为: {NewValue}", model.Value);
        }, cancellationToken);
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken)
    {
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        _timer?.Dispose();
        GC.SuppressFinalize(this);
    }
}
