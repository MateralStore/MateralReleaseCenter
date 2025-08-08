using Materal.MergeBlock.Consul.Abstractions;
using MateralReleaseCenter.EnvironmentServer.Repository;

namespace MateralReleaseCenter.EnvironmentServer.Application
{
    /// <summary>
    /// EnvironmentServer模块
    /// </summary>
    [DependsOn(typeof(EnvironmentServerRepositoryModule))]
    public class EnvironmentServerModule() : MateralReleaseCenterModule("MateralReleaseCenterEnvironmentServer模块")
    {
        /// <inheritdoc/>
        public override void OnConfigureServices(ServiceConfigurationContext context)
        {
            base.OnConfigureServices(context);
            context.Services.AddConsulConfig("MateralReleaseCenterEnvironmentServer", ["MateralReleaseCenter.EnvironmentServer"]);
        }
    }
}