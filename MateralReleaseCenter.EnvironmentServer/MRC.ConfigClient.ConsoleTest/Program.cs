using Materal.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MRC.ConfigClient.ConsoleTest;

internal class Program
{
    static async Task Main(string[] args)
    {
        IHost host = Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((context, config) =>
            {
                config.SetBasePath(Directory.GetCurrentDirectory());
                config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
                config.AddMRCConfig("http://winserver.devserver.ink:10000/MRCESAPI_Dev", "TestProject", ["TestNamespace"], TimeSpan.FromSeconds(5));
            })
            .ConfigureServices((context, services) =>
            {
                MateralServices.Services = services;
                services.AddMRCConfig();
                services.Configure<AppConfig>(context.Configuration);
                services.AddHostedService<TestConfigService>();
            })
            .Build();
        MateralServices.ServiceProvider = host.Services;
        await host.RunAsync();
    }
}
