using MateralReleaseCenter.DeployServer.Abstractions.DTO.ApplicationInfo;
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
        if (applicationRuntime.ApplicationStatus != ApplicationStatusEnum.Stop) throw new MateralReleaseCenterException("应用程序尚未停止");
        if (applicationRuntime.ApplicationInfo.ApplicationType != ApplicationTypeEnum.Exe) throw new MateralReleaseCenterException("处理器类型错误");
        string workingDirectory = GetWorkingDirectory(applicationRuntime);
        if (!Directory.Exists(workingDirectory)) throw new MateralReleaseCenterException($"应用程序目录不存在: {workingDirectory}");
        string exePath = Path.Combine(workingDirectory, $"{applicationRuntime.ApplicationInfo.MainModule}");
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows) && !exePath.EndsWith(".exe", StringComparison.OrdinalIgnoreCase)) throw new MateralReleaseCenterException("主模块必须以.exe结尾");
        if (!File.Exists(exePath)) throw new MateralReleaseCenterException($"应用程序主模块不存在: {exePath}");

        string runParams = await GetRunParamsAsync(applicationRuntime, ApplicationTypeEnum.Exe);
        List<EnvironmentDTO> environments = await GetEnvironmentsAsync(applicationRuntime, ApplicationTypeEnum.Exe);
        string arguments = string.IsNullOrWhiteSpace(runParams) ? string.Empty : runParams;


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
            applicationRuntime.AddConsoleMessage($"执行命令: {exePath} {arguments}");

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
    public override async Task StopApplicationAsync(ApplicationRuntimeModel applicationRuntime) => await StopApplicationAsync(applicationRuntime, ApplicationTypeEnum.Exe);
}
