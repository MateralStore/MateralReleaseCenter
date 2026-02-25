using MateralReleaseCenter.DeployServer.Abstractions.DTO.DefaultData;
using MateralReleaseCenter.DeployServer.Abstractions.Services.Models.DefaultData;

namespace MateralReleaseCenter.DeployServer.Application.Services
{
    public partial class DefaultDataServiceImpl
    {
        /// <summary>
        /// 添加
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        /// <exception cref="MateralReleaseCenterException"></exception>
        public override async Task<Guid> AddAsync(AddDefaultDataModel model)
        {
            if (await DefaultRepository.ExistedAsync(m => m.ApplicationType == model.ApplicationType && m.Key == model.Key)) throw new MateralReleaseCenterException("键重复");
            return await base.AddAsync(model);
        }
        /// <summary>
        /// 修改
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        /// <exception cref="MateralReleaseCenterException"></exception>
        public override async Task EditAsync(EditDefaultDataModel model)
        {
            if (await DefaultRepository.ExistedAsync(m => m.ID != model.ID && m.ApplicationType == model.ApplicationType && m.Key == model.Key)) throw new MateralReleaseCenterException("键重复");
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
        protected override async Task<(List<DefaultDataListDTO> data, RangeModel rangeInfo)> GetListAsync(Expression<Func<DefaultData, bool>> expression, QueryDefaultDataModel model, Expression<Func<DefaultData, object>>? orderExpression = null, SortOrder sortOrder = SortOrder.Descending)
        {
            if (orderExpression == null)
            {
                sortOrder = SortOrder.Ascending;
                orderExpression = m => m.Key;
            }
            return await base.GetListAsync(expression, model, orderExpression, sortOrder);
        }
    }
}
