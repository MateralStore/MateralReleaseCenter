using Materal.MergeBlock.Abstractions;
using Materal.MergeBlock.Web.Abstractions.ControllerHttpHelper;
using Materal.Utils.Extensions;
using MateralReleaseCenter.Core.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace MateralReleaseCenter.Core.Application;

/// <summary>
/// MateralReleaseCenter模块
/// </summary>
public abstract class MateralReleaseCenterModule(string moduleName) : MergeBlockModule(moduleName)
{
    /// <inheritdoc/>
    public override void OnPreConfigureServices(ServiceConfigurationContext context)
    {
        if (context.Configuration is not IConfigurationBuilder configurationBuilder) return;
        Type moduleType = GetType();
        string configFilePath = moduleType.Assembly.GetDirectoryPath();
        configFilePath = Path.Combine(configFilePath, $"{moduleType.Namespace}.json");
        configurationBuilder.AddJsonFile(configFilePath, optional: true, reloadOnChange: true);
    }
    /// <inheritdoc/>
    public override void OnConfigureServices(ServiceConfigurationContext context)
        => context.Services.TryAddSingleton<IControllerHttpHelper, MateralReleaseCenterControllerHttpHelper>();
}