using Materal.EventBus.Abstraction;
using Materal.EventBus.RabbitMQ;

namespace MateralReleaseCenter.DeployServer.Application.EventHandlers;

/// <summary>
/// DeployServer事件处理器
/// </summary>
/// <typeparam name="TEvent"></typeparam>
public abstract class DeployServerEventHandler<TEvent>(IOptionsMonitor<ApplicationConfig> applicationConfig, IOptionsMonitor<ConsulOptions> consulConfig) : BaseEventHandler<TEvent>, IEventHandler<TEvent>, IRabbitMQEventHandler
    where TEvent : IEvent
{
    /// <summary>
    /// 应用程序配置
    /// </summary>
    protected readonly IOptionsMonitor<ApplicationConfig> AppConfig = applicationConfig;
    /// <summary>
    /// Cconsul配置
    /// </summary>
    protected readonly IOptionsMonitor<ConsulOptions> CconsulConfig = consulConfig;
    /// <summary>
    /// 队列名称
    /// </summary>
    public string QueueName => $"MRCDSQueue_{CconsulConfig.CurrentValue.Name}";
}
