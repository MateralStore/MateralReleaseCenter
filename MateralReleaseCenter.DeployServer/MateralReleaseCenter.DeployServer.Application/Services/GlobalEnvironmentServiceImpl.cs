using MateralReleaseCenter.DeployServer.Abstractions.DTO.GlobalEnvironment;
using MateralReleaseCenter.DeployServer.Abstractions.Services.Models.GlobalEnvironment;

namespace MateralReleaseCenter.DeployServer.Application.Services;

public partial class GlobalEnvironmentServiceImpl
{
    /// <summary>
    /// 添加
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    /// <exception cref="MateralReleaseCenterException"></exception>
    public override async Task<Guid> AddAsync(AddGlobalEnvironmentModel model)
    {
        if (await DefaultRepository.ExistedAsync(m => m.ApplicationType == model.ApplicationType && m.Key == model.Key)) throw new MateralReleaseCenterException("名称重复");
        return await base.AddAsync(model);
    }
    /// <summary>
    /// 修改
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    /// <exception cref="MateralReleaseCenterException"></exception>
    public override async Task EditAsync(EditGlobalEnvironmentModel model)
    {
        if (await DefaultRepository.ExistedAsync(m => m.ID != model.ID && m.ApplicationType == model.ApplicationType && m.Key == model.Key)) throw new MateralReleaseCenterException("名称重复");
        await base.EditAsync(model);
    }
    /// <summary>
    /// 获取列表
    /// </summary>
    /// <param name="expression"></param>
    /// <param name="model"></param>
    /// <param name="orderExpression"></param>
    /// <param name="sortOrder"></param>
    /// <returns></returns>
    protected override async Task<(List<GlobalEnvironmentListDTO> data, RangeModel rangeInfo)> GetListAsync(Expression<Func<GlobalEnvironment, bool>> expression, QueryGlobalEnvironmentModel model, Expression<Func<GlobalEnvironment, object>>? orderExpression = null, SortOrder sortOrder = SortOrder.Descending)
    {
        if (orderExpression == null)
        {
            sortOrder = SortOrder.Ascending;
            orderExpression = m => m.Key;
        }
        return await base.GetListAsync(expression, model, orderExpression, sortOrder);
    }
}
