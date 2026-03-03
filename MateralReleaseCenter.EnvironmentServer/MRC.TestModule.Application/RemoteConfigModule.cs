using Materal.MergeBlock.Abstractions.Extensions;
using Microsoft.Extensions.DependencyInjection;

namespace MRC.TestModule.Application;

/// <summary>
/// 测试模块
/// </summary>
public class TestModule() : MergeBlockModule("测试模块")
{
    /// <inheritdoc/>
    public override void OnConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.Configure<AppConfig>(context.Configuration!);
        context.Services.AddMergeBlockHostedService<TestConfigService>();
        base.OnConfigureServices(context);
    }
}
