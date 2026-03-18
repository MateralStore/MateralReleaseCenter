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
        string workingDirectory = GetWorkingDirectory(applicationRuntime);
        if (!Directory.Exists(workingDirectory)) throw new MateralReleaseCenterException($"应用程序目录不存在: {workingDirectory}");
        string dllPath = Path.Combine(workingDirectory, applicationRuntime.ApplicationInfo.MainModule);
        if (!dllPath.EndsWith(".dll", StringComparison.OrdinalIgnoreCase)) throw new MateralReleaseCenterException("DotNet应用程序的主模块必须为.dll文件");
        if (!File.Exists(dllPath)) throw new MateralReleaseCenterException($"应用程序主模块不存在: {dllPath}");

        string runParams = await GetRunParamsAsync(applicationRuntime, ApplicationTypeEnum.DotNet);
        List<EnvironmentsModel> environments = await GetEnvironmentsAsync(applicationRuntime, ApplicationTypeEnum.DotNet);
        string arguments = string.IsNullOrWhiteSpace(runParams) ? dllPath : $"{dllPath} {runParams}";

        applicationRuntime.ApplicationStatus = ApplicationStatusEnum.ReadyRun;
        applicationRuntime.ClearConsoleMessage();
        applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}准备启动....");

        try
        {
            ProcessStartInfo processStartInfo = ProcessStartInfoHelper.Create("dotnet", arguments, workingDirectory, environments);

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
}
