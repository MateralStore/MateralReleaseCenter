using MateralReleaseCenter.ServerCenter.Abstractions.Events;

namespace MateralReleaseCenter.DeployServer.Application.EventHandlers;

/// <summary>
/// 源码更新事件
/// </summary>
/// <param name="applicationConfig"></param>
/// <param name="consulConfig"></param>
public class SourceCodeUpdateEventHandler(IOptionsMonitor<ApplicationConfig> applicationConfig, IOptionsMonitor<ConsulOptions> consulConfig) : DeployServerEventHandler<SourceCodeUpdateEvent>(applicationConfig, consulConfig)
{
    /// <inheritdoc/>
    public override Task HandleAsync(SourceCodeUpdateEvent @event)
    {
        throw new NotImplementedException();
    }
}
