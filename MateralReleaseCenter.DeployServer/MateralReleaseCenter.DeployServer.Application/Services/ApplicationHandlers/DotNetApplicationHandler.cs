using MateralReleaseCenter.DeployServer.Application.Services.Models;
using System.Diagnostics;

namespace MateralReleaseCenter.DeployServer.Application.Services.ApplicationHandlers;

/// <summary>
/// DotNet应用程序处理器
/// </summary>
public class DotNetApplicationHandler : ApplicationHandler
{
    /// <summary>
    /// 启动应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public override async Task StartApplicationAsync(ApplicationRuntimeModel applicationRuntime)
    {
        if (applicationRuntime.ApplicationStatus != ApplicationStatusEnum.Stop) throw new MateralReleaseCenterException("应用程序尚未停止");

        if (applicationRuntime.ApplicationInfo.ApplicationType != ApplicationTypeEnum.DotNet) throw new MateralReleaseCenterException("处理器类型错误");

        string dllPath = Path.Combine(typeof(DeployServerModule).Assembly.GetDirectoryPath(), "Application", applicationRuntime.ApplicationInfo.RootPath, applicationRuntime.ApplicationInfo.MainModule); if (!dllPath.EndsWith(".dll", StringComparison.OrdinalIgnoreCase)) throw new MateralReleaseCenterException("DotNet应用程序的主模块必须为.dll文件");

        string runParams = await GetRunParamsAsync(applicationRuntime);
        string arguments = string.IsNullOrWhiteSpace(runParams) ? dllPath : $"{dllPath} {runParams}";
        applicationRuntime.ApplicationStatus = ApplicationStatusEnum.ReadyRun;
        applicationRuntime.ClearConsoleMessage();
        applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}准备启动....");
        try
        {
            ProcessStartInfo processStartInfo = new()
            {
                FileName = "dotnet",
                Arguments = arguments,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                WorkingDirectory = Path.Combine(typeof(DeployServerModule).Assembly.GetDirectoryPath(), "Application", applicationRuntime.ApplicationInfo.RootPath)
            };

            BindProcess = new Process { StartInfo = processStartInfo };
            void DataHandler(object? sender, DataReceivedEventArgs e)
            {
                if (string.IsNullOrWhiteSpace(e.Data)) return;
                applicationRuntime.AddConsoleMessage(e.Data);
            }

            BindProcess.OutputDataReceived += DataHandler;
            BindProcess.ErrorDataReceived += DataHandler;

            applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}开始启动");
            applicationRuntime.AddConsoleMessage($"执行命令: dotnet {arguments}");

            if (BindProcess.Start())
            {
                applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}启动完毕 (PID: {BindProcess.Id})");
                BindProcess.BeginOutputReadLine();
                BindProcess.BeginErrorReadLine();
            }
            else
            {
                throw new MateralReleaseCenterException("启动失败");
            }

            applicationRuntime.ApplicationStatus = ApplicationStatusEnum.Runing;
        }
        catch (Exception ex)
        {
            applicationRuntime.ApplicationStatus = ApplicationStatusEnum.Stop;
            applicationRuntime.AddConsoleMessage(ex.GetErrorMessage());
            applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}已停止");
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 停止应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public override async Task StopApplicationAsync(ApplicationRuntimeModel applicationRuntime)
    {
        if (applicationRuntime.ApplicationInfo.ApplicationType != ApplicationTypeEnum.DotNet) throw new MateralReleaseCenterException("处理器类型错误");

        applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}准备停止");
        applicationRuntime.ApplicationStatus = ApplicationStatusEnum.Stoping;

        try
        {
            CloseProcess(applicationRuntime);
            applicationRuntime.ApplicationStatus = ApplicationStatusEnum.Stop;
            applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}已停止");
        }
        catch (Exception ex)
        {
            applicationRuntime.ApplicationStatus = ApplicationStatusEnum.Runing;
            applicationRuntime.AddConsoleMessage(ex.GetErrorMessage());
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 获取运行参数
    /// </summary>
    private async Task<string> GetRunParamsAsync(ApplicationRuntimeModel model)
    {
        using IServiceScope scope = MateralServices.ServiceProvider.CreateScope();
        IDefaultDataRepository defaultDataRepository = scope.ServiceProvider.GetRequiredService<IDefaultDataRepository>();
        List<DefaultData> defaultDatas = await defaultDataRepository.FindAsync(m => m.ApplicationType == ApplicationTypeEnum.DotNet);

        List<string> runParams = [];
        if (model.ApplicationInfo.RunParams is not null && !string.IsNullOrWhiteSpace(model.ApplicationInfo.RunParams))
        {
            runParams.Add(model.ApplicationInfo.RunParams);
        }

        foreach (DefaultData defaultData in defaultDatas)
        {
            runParams.Add($"--{defaultData.Key}={defaultData.Data}");
        }

        return string.Join(" ", runParams);
    }
}
