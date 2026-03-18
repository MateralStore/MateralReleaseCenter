using MateralReleaseCenter.DeployServer.Abstractions.DTO.GlobalParameter;
using MateralReleaseCenter.DeployServer.Abstractions.Services.Models.GlobalParameter;

namespace MateralReleaseCenter.DeployServer.Application.Services;

public partial class GlobalParameterServiceImpl
{
    /// <summary>
    /// 添加
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    /// <exception cref="MateralReleaseCenterException"></exception>
    public override async Task<Guid> AddAsync(AddGlobalParameterModel model)
    {
        if (await DefaultRepository.ExistedAsync(m => m.ApplicationType == model.ApplicationType && m.Name == model.Name)) throw new MateralReleaseCenterException("名称重复");
        return await base.AddAsync(model);
    }
    /// <summary>
    /// 修改
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    /// <exception cref="MateralReleaseCenterException"></exception>
    public override async Task EditAsync(EditGlobalParameterModel model)
    {
        if (await DefaultRepository.ExistedAsync(m => m.ID != model.ID && m.ApplicationType == model.ApplicationType && m.Name == model.Name)) throw new MateralReleaseCenterException("名称重复");
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
    protected override async Task<(List<GlobalParameterListDTO> data, RangeModel rangeInfo)> GetListAsync(Expression<Func<GlobalParameter, bool>> expression, QueryGlobalParameterModel model, Expression<Func<GlobalParameter, object>>? orderExpression = null, SortOrder sortOrder = SortOrder.Descending)
    {
        if (orderExpression == null)
        {
            sortOrder = SortOrder.Ascending;
            orderExpression = m => m.Name;
        }
        return await base.GetListAsync(expression, model, orderExpression, sortOrder);
    }
}
