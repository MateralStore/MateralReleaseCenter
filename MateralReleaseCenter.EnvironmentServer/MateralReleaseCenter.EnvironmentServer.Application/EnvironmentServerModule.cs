using MateralReleaseCenter.EnvironmentServer.Repository;

namespace MateralReleaseCenter.EnvironmentServer.Application;

/// <summary>
/// EnvironmentServer模块
/// </summary>
[DependsOn(typeof(EnvironmentServerRepositoryModule))]
public class EnvironmentServerModule() : MateralReleaseCenterModule("MateralReleaseCenterEnvironmentServer模块")
{
}