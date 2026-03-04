using Materal.EventBus.Abstraction;

namespace MateralReleaseCenter.ServerCenter.Abstractions.Events;

/// <summary>
/// 源码更新事件
/// </summary>
public class SourceCodeUpdateEvent : IEvent
{
    /// <summary>
    /// 仓库Url
    /// </summary>
    public string? RepositoryUrl { get; set; }
}
