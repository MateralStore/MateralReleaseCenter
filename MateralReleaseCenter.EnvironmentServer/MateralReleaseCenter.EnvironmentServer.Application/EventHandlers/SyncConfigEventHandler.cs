using MateralReleaseCenter.EnvironmentServer.Abstractions.DTO.ConfigurationItem;
using MateralReleaseCenter.EnvironmentServer.Abstractions.Enums;
using MateralReleaseCenter.EnvironmentServer.Abstractions.Events;

namespace MateralReleaseCenter.EnvironmentServer.Application.EventHandlers;

/// <summary>
/// 同步配置事件处理器
/// </summary>
public class SyncConfigEventHandler(IOptionsMonitor<ApplicationConfig> applicationConfig, IOptionsMonitor<ConsulOptions> consulConfig, IMapper mapper, IEnvironmentServerUnitOfWork unitOfWork, IConfigurationItemRepository configurationItemRepository) : EnvironmentServerEventHandler<SyncConfigEvent>(applicationConfig, consulConfig)
{
    private static readonly SemaphoreSlim SyncLock = new(1, 1);
    /// <summary>
    /// 处理
    /// </summary>
    /// <param name="event"></param>
    /// <returns></returns>
    public override async Task HandleAsync(SyncConfigEvent @event)
    {
        if (@event.TargetEnvironments.Length == 0 || !@event.TargetEnvironments.Contains(CconsulConfig.CurrentValue.Name)) return;
        await SyncLock.WaitAsync();
        try
        {
            switch (@event.Mode)
            {
                case SyncModeEnum.Mission:
                    await AddItemsAsync(@event.ConfigurationItems);
                    break;
                case SyncModeEnum.Replace:
                    await ReplaceItemsAsync(@event.ConfigurationItems);
                    break;
                case SyncModeEnum.Cover:
                    List<Guid> projectIDs = [.. @event.ConfigurationItems.Select(m => m.ProjectID).Distinct()];
                    if (projectIDs.Count > 1) break;
                    await ClearItemsByProjectIDAsync(projectIDs.First());
                    await AddItemsAsync(@event.ConfigurationItems);
                    break;
            }
        }
        finally
        {
            SyncLock.Release();
        }
    }
    /// <summary>
    /// 添加项
    /// </summary>
    /// <param name="configurationItems"></param>
    /// <returns></returns>
    private async Task AddItemsAsync(List<ConfigurationItemListDTO> configurationItems)
    {
        List<ConfigurationItem> allConfigurationItems = configurationItemRepository.Find(m => true);
        foreach (ConfigurationItemListDTO item in configurationItems)
        {
            if (allConfigurationItems.Any(m => m.ProjectID == item.ProjectID && m.NamespaceID == item.NamespaceID && m.Key == item.Key)) continue;
            ConfigurationItem target = mapper.Map<ConfigurationItem>(item) ?? throw new MateralReleaseCenterException("映射失败");
            target.ID = Guid.NewGuid();
            unitOfWork.RegisterAdd(target);
        }
        await unitOfWork.CommitAsync();
    }
    /// <summary>
    /// 替换项
    /// </summary>
    /// <param name="configurationItems"></param>
    /// <returns></returns>
    private async Task ReplaceItemsAsync(List<ConfigurationItemListDTO> configurationItems)
    {
        List<ConfigurationItem> allConfigurationItems = configurationItemRepository.Find(m => true);
        foreach (ConfigurationItemListDTO item in configurationItems)
        {
            ConfigurationItem? target = allConfigurationItems.FirstOrDefault(m => m.ProjectID == item.ProjectID && m.NamespaceID == item.NamespaceID && m.Key == item.Key);
            if (target == null) continue;
            mapper.Map(item, target);
            unitOfWork.RegisterEdit(target);
        }
        await unitOfWork.CommitAsync();
    }
    /// <summary>
    /// 根据项目唯一标识清空项
    /// </summary>
    /// <param name="projectID"></param>
    /// <returns></returns>
    private async Task ClearItemsByProjectIDAsync(Guid projectID)
    {
        List<ConfigurationItem> allConfigurationItems = configurationItemRepository.Find(m => m.ProjectID == projectID);
        foreach (ConfigurationItem item in allConfigurationItems)
        {
            unitOfWork.RegisterDelete(item);
        }
        await unitOfWork.CommitAsync();
    }
}
