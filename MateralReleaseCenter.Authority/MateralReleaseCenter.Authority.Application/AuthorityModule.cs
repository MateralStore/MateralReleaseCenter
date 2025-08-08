using Materal.MergeBlock.Consul.Abstractions;
using MateralReleaseCenter.Authority.Repository;

namespace MateralReleaseCenter.Authority.Application;

/// <summary>
/// Authority模块
/// </summary>
[DependsOn(typeof(AuthorityRepositoryModule))]
public class AuthorityModule() : MateralReleaseCenterModule("MateralReleaseCenterAuthority模块")
{
    /// <inheritdoc/>
    public override void OnConfigureServices(ServiceConfigurationContext context)
    {
        base.OnConfigureServices(context);
        context.Services.AddConsulConfig("MateralReleaseCenterAuthority", ["MateralReleaseCenter.Authority"]);
    }
}