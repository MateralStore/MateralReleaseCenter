using MateralReleaseCenter.DeployServer.Abstractions.DTO.ApplicationInfo;
using MateralReleaseCenter.ServerCenter.Abstractions.Events;

namespace MateralReleaseCenter.DeployServer.Application.EventHandlers;

/// <summary>
/// 源码更新事件
/// </summary>
public class SourceCodeUpdateEventHandler(IApplicationInfoService service, IOptionsMonitor<ApplicationConfig> applicationConfig, IOptionsMonitor<ConsulOptions> consulConfig) : DeployServerEventHandler<SourceCodeUpdateEvent>(applicationConfig, consulConfig)
{
    /// <inheritdoc/>
    public override async Task HandleAsync(SourceCodeUpdateEvent @event)
    {
        if (string.IsNullOrWhiteSpace(@event.RepositoryUrl)) return;
        (List<ApplicationInfoListDTO> data, RangeModel rangeInfo) = await service.GetListAsync(new() { RepositoryUrl = @event.RepositoryUrl });
        foreach (ApplicationInfoListDTO item in data)
        {
            service.ApplyLasetReleases(item.ID);
        }
    }
}
