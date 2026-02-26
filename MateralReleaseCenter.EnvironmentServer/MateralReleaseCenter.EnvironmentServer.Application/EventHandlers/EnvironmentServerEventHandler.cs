using Materal.EventBus.Abstraction;

namespace MateralReleaseCenter.EnvironmentServer.Application.EventHandlers;

/// <summary>
/// EnvironmentServer事件处理器
/// </summary>
/// <typeparam name="TEvent"></typeparam>
public abstract class EnvironmentServerEventHandler<TEvent>(IOptionsMonitor<ApplicationConfig> applicationConfig) : BaseEventHandler<TEvent>, IEventHandler<TEvent>, IRabbitMQEventHandler
    where TEvent : IEvent
{
    /// <summary>
    /// 应用程序配置
    /// </summary>
    protected readonly IOptionsMonitor<ApplicationConfig> AppConfig = applicationConfig;
    /// <summary>
    /// 队列名称
    /// </summary>
    public string QueueName => "MRCESQueue";
}
