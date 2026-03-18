using MateralReleaseCenter.DeployServer.Application.Services.Models;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace MateralReleaseCenter.DeployServer.Application.Services.ApplicationHandlers;

/// <summary>
/// Exe应用程序处理器
/// </summary>
public class ExeApplicationHandler : ApplicationHandler
{
    /// <summary>
    /// 启动应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public override async Task StartApplicationAsync(ApplicationRuntimeModel applicationRuntime)
    {
        string exePath = Path.Combine(typeof(DeployServerModule).Assembly.GetDirectoryPath(), "Application", applicationRuntime.ApplicationInfo.RootPath, $"{applicationRuntime.ApplicationInfo.MainModule}");
        await StartApplicationAsync(applicationRuntime, exePath);
    }
    /// <summary>
    /// 停止应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public override async Task StopApplicationAsync(ApplicationRuntimeModel applicationRuntime) => await StopApplicationAsync(applicationRuntime, ApplicationTypeEnum.Exe);
    /// <summary>
    /// 开始一个应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    /// <param name="exePath"></param>
    public virtual async Task StartApplicationAsync(ApplicationRuntimeModel applicationRuntime, string exePath)
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows) && !exePath.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
            throw new MateralReleaseCenterException("主模块必须以.exe结尾");
        if (applicationRuntime.ApplicationStatus != ApplicationStatusEnum.Stop) throw new MateralReleaseCenterException("应用程序尚未停止");

        string workingDirectory = Path.Combine(typeof(DeployServerModule).Assembly.GetDirectoryPath(), "Application", applicationRuntime.ApplicationInfo.RootPath);
        string runParams = await GetRunParamsAsync(applicationRuntime, ApplicationTypeEnum.NodeJs);
        List<EnvironmentsModel> environments = await GetEnvironmentsAsync(applicationRuntime, ApplicationTypeEnum.NodeJs);
        string arguments = !string.IsNullOrWhiteSpace(runParams) ? runParams : "";

        applicationRuntime.ApplicationStatus = ApplicationStatusEnum.ReadyRun;
        applicationRuntime.ClearConsoleMessage();
        applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}准备启动....");
        try
        {
            ProcessStartInfo processStartInfo = ProcessStartInfoHelper.Create(exePath, arguments, workingDirectory, environments, createNoWindow: false, showMinimizedOnWindows: true);
            BindProcess = new Process { StartInfo = processStartInfo };
            void DataHandler(object sender, DataReceivedEventArgs e)
            {
                if (string.IsNullOrWhiteSpace(e.Data)) return;
                applicationRuntime.AddConsoleMessage(e.Data);
            }
            BindProcess.OutputDataReceived += DataHandler;
            BindProcess.ErrorDataReceived += DataHandler;
            applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}开始启动");
            if (BindProcess.Start())
            {
                applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}启动完毕");
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
}
