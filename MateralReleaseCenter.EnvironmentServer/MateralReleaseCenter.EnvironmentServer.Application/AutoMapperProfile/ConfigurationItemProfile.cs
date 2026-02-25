using Materal.Utils.Helpers;
using MateralReleaseCenter.EnvironmentServer.Abstractions.DTO.ConfigurationItem;

namespace MateralReleaseCenter.EnvironmentServer.Application.AutoMapperProfile;

/// <summary>
/// 配置项配置文件
/// </summary>
public partial class ConfigurationItemProfile : Profile
{
    /// <summary>
    /// 构造方法
    /// </summary>
    public ConfigurationItemProfile()
    {
        CreateMap<ConfigurationItemListDTO, ConfigurationItem>((mapper, m, n) =>
        {
            CopyPropertiesHelper.CopyProperties(m, n, nameof(n.ID));
        }, null, false);
    }
}
