using Materal.EventBus.Abstraction;
using MateralReleaseCenter.EnvironmentServer.Abstractions.DTO.ConfigurationItem;
using MateralReleaseCenter.EnvironmentServer.Abstractions.Events;
using MateralReleaseCenter.EnvironmentServer.Abstractions.Services.Models.ConfigurationItem;
using MateralReleaseCenter.ServerCenter.Abstractions.Controllers;
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.Namespace;
using MateralReleaseCenter.ServerCenter.Abstractions.DTO.Project;

namespace MateralReleaseCenter.EnvironmentServer.Application.Services
{
    /// <summary>
    /// 配置项服务
    /// </summary>
    public partial class ConfigurationItemServiceImpl(IEventBus eventBus, IProjectController projectHttpClient, INamespaceController namespaceHttpClient)
    {
        /// <summary>
        /// 添加配置项
        /// </summary>
        /// <param name="domain"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        /// <exception cref="MateralReleaseCenterException"></exception>
        protected override async Task<Guid> AddAsync(ConfigurationItem domain, AddConfigurationItemModel model)
        {
            NamespaceListDTO @namespace = await namespaceHttpClient.FirstOrDefaultAsync(model.NamespaceID) ?? throw new MateralReleaseCenterException("命名空间不存在");
            if (await DefaultRepository.ExistedAsync(m => m.NamespaceID == model.NamespaceID && m.ProjectID == @namespace.ProjectID && m.Key == model.Key)) throw new MateralReleaseCenterException("键重复");
            ProjectListDTO project = await projectHttpClient.FirstOrDefaultAsync(@namespace.ProjectID) ?? throw new MateralReleaseCenterException("项目不存在");
            domain.NamespaceName = @namespace.Name;
            domain.ProjectID = project.ID;
            domain.ProjectName = project.Name;
            return await base.AddAsync(domain, model);
        }
        /// <summary>
        /// 编辑配置项
        /// </summary>
        /// <param name="domainFromDB"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        /// <exception cref="MateralReleaseCenterException"></exception>
        protected override async Task EditAsync(ConfigurationItem domainFromDB, EditConfigurationItemModel model)
        {
            if (await DefaultRepository.ExistedAsync(m => m.ID != model.ID && m.NamespaceID == domainFromDB.NamespaceID && m.ProjectID == domainFromDB.ProjectID && m.Key == model.Key)) throw new MateralReleaseCenterException("键重复");
            await base.EditAsync(domainFromDB, model);
        }
        /// <summary>
        /// 获取列表
        /// </summary>
        /// <param name="expression"></param>
        /// <param name="model"></param>
        /// <param name="orderExpression"></param>
        /// <param name="sortOrder"></param>
        /// <returns></returns>
        protected override async Task<(List<ConfigurationItemListDTO> data, RangeModel rangeInfo)> GetListAsync(Expression<Func<ConfigurationItem, bool>> expression, QueryConfigurationItemModel model, Expression<Func<ConfigurationItem, object>>? orderExpression = null, SortOrderEnum sortOrder = SortOrderEnum.Descending)
            => await base.GetListAsync(expression, model, m => m.Key, SortOrderEnum.Ascending);
        /// <summary>
        /// 初始化
        /// </summary>
        /// <returns></returns>
        public async Task InitAsync()
        {
            List<ConfigurationItem> configurationItems = await DefaultRepository.FindAsync(m => true);
            List<ConfigurationItem> removeItems = [];
            Guid[] hastIDs;
            Guid[] removeIDs;
            #region 移除项目不存在的
            Guid[] allProjectIDs = configurationItems.Select(m => m.ProjectID).Distinct().ToArray();
            if (allProjectIDs.Length > 0)
            {
                CollectionResultModel<ProjectListDTO> allProjectInfo = await projectHttpClient.GetListAsync(new()
                {
                    PageIndex = 1,
                    PageSize = allProjectIDs.Length,
                    IDs = [.. allProjectIDs]
                });
                if (allProjectInfo.Data != null && allProjectInfo.Data.Count > 0)
                {
                    hastIDs = allProjectInfo.Data.Select(m => m.ID).ToArray();
                    removeIDs = allProjectIDs.Except(hastIDs).ToArray();
                    if (removeIDs.Length > 0)
                    {
                        removeItems.AddRange(configurationItems.Where(m => removeIDs.Contains(m.ProjectID)).ToList());
                    }
                }
            }
            #endregion
            #region 移除命名空间不存在的
            Guid[] allNamespaceIDs = configurationItems.Select(m => m.NamespaceID).Distinct().ToArray();
            if (allNamespaceIDs.Length > 0)
            {
                CollectionResultModel<NamespaceListDTO> allNamespaceInfo = await namespaceHttpClient.GetListAsync(new()
                {
                    PageIndex = 1,
                    PageSize = allNamespaceIDs.Length,
                    IDs = [.. allNamespaceIDs]
                });
                if (allNamespaceInfo.Data != null && allNamespaceInfo.Data.Count > 0)
                {
                    hastIDs = allNamespaceInfo.Data.Select(m => m.ID).ToArray();
                    removeIDs = allNamespaceIDs.Except(hastIDs).ToArray();
                    if (removeIDs.Length > 0)
                    {
                        removeItems.AddRange(configurationItems.Where(m => removeIDs.Contains(m.NamespaceID)).ToList());
                    }
                }
            }
            #endregion
            removeItems = removeItems.Distinct().ToList();
            foreach (ConfigurationItem item in removeItems)
            {
                UnitOfWork.RegisterDelete(item);
            }
            await UnitOfWork.CommitAsync();
        }
        /// <summary>
        /// 同步配置
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        /// <exception cref="MateralReleaseCenterException"></exception>
        public async Task SyncConfigAsync(SyncConfigModel model)
        {
            if (model.TargetEnvironments.Length <= 0) throw new MateralReleaseCenterException("同步目标为0");
            List<ConfigurationItem> configurationItems = await DefaultRepository.FindAsync(model);
            SyncConfigEvent @event = new()
            {
                Mode = model.Mode,
                TargetEnvironments = model.TargetEnvironments,
                ConfigurationItems = Mapper.Map<List<ConfigurationItemListDTO>>(configurationItems) ?? throw new MateralReleaseCenterException("映射失败")
            };
            await eventBus.PublishAsync(@event);
        }
    }
}
