using MateralReleaseCenter.DeployServer.Abstractions.DTO.ApplicationInfo;
using MateralReleaseCenter.DeployServer.Application.Services.Models;

namespace MateralReleaseCenter.DeployServer.Application.AutoMapperProfile
{
    /// <summary>
    /// 应用程序信息映射配置
    /// </summary>
    public partial class ApplicationInfoProfile : Profile
    {
        /// <summary>
        /// 初始化
        /// </summary>
        protected ApplicationInfoProfile()
        {
            CreateMap<ApplicationRuntimeModel, ApplicationInfoDTO>((mapper, m, n) =>
            {
                ApplicationRuntimeModelToDTO(m, n);
            });
            CreateMap<ApplicationRuntimeModel, ApplicationInfoListDTO>((mapper, m, n) =>
            {
                ApplicationRuntimeModelToDTO(m, n);
            });
        }
        /// <summary>
        /// 模型转换为数据传输模型
        /// </summary>
        /// <param name="model"></param>
        /// <param name="dto"></param>
        private void ApplicationRuntimeModelToDTO(ApplicationRuntimeModel model, ApplicationInfoListDTO dto)
        {
            dto.ID = model.ApplicationInfo.ID;
            dto.CreateTime = model.ApplicationInfo.CreateTime;
            dto.Name = model.ApplicationInfo.Name;
            dto.RootPath = model.ApplicationInfo.RootPath;
            dto.MainModule = model.ApplicationInfo.MainModule;
            dto.ApplicationType = model.ApplicationInfo.ApplicationType;
            dto.IsIncrementalUpdating = model.ApplicationInfo.IsIncrementalUpdating;
            dto.RunParams = model.ApplicationInfo.RunParams;
        }
    }
}
