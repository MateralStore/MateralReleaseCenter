using MateralReleaseCenter.EnvironmentServer.Repository;
using MateralReleaseCenter.ServerCenter.Abstractions.ControllerAccessors;

namespace MateralReleaseCenter.EnvironmentServer.Application;

/// <summary>
/// EnvironmentServer模块
/// </summary>
[DependsOn(typeof(EnvironmentServerRepositoryModule))]
public class EnvironmentServerModule() : MateralReleaseCenterModule("MateralReleaseCenterEnvironmentServer模块")
{
    /// <inheritdoc/>
    public override void OnConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddServerCenterControllerAccessors();
        base.OnConfigureServices(context);
    }
}