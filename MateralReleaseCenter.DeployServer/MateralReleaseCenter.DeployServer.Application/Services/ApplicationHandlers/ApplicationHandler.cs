using MateralReleaseCenter.DeployServer.Application.Services.Models;
using System.Diagnostics;

namespace MateralReleaseCenter.DeployServer.Application.Services.ApplicationHandlers;

/// <summary>
/// 应用程序处理器
/// </summary>
public abstract class ApplicationHandler : IApplicationHandler
{
    /// <summary>
    /// 绑定进程
    /// </summary>
    public Process? BindProcess { get; protected set; }
    /// <summary>
    /// 启动应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public abstract Task StartApplicationAsync(ApplicationRuntimeModel applicationRuntime);
    /// <summary>
    /// 停止应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public abstract Task StopApplicationAsync(ApplicationRuntimeModel applicationRuntime);
    /// <summary>
    /// 杀死应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    public virtual async Task KillApplicationAsync(ApplicationRuntimeModel applicationRuntime)
    {
        if (applicationRuntime.ApplicationStatus == ApplicationStatusEnum.Stop) throw new MateralReleaseCenterException("应用程序尚未启动");
        KillProcess();
        applicationRuntime.ApplicationStatus = ApplicationStatusEnum.Stop;
        applicationRuntime.AddConsoleMessage($"{applicationRuntime.ApplicationInfo.Name}已强制停止");
        await Task.CompletedTask;
    }
    /// <summary>
    /// 停止应用程序
    /// </summary>
    /// <param name="applicationRuntime"></param>
    /// <param name="applicationType"></param>
    protected virtual async Task StopApplicationAsync(ApplicationRuntimeModel applicationRuntime, ApplicationTypeEnum applicationType)
    {
        if (applicationRuntime.ApplicationInfo.ApplicationType != applicationType) throw new MateralReleaseCenterException("处理器类型错误");
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
    /// 关闭进程
    /// </summary>
    /// <param name="applicationRuntime"></param>
    protected virtual void CloseProcess(ApplicationRuntimeModel applicationRuntime)
    {
        if (BindProcess == null) return;
        // 尝试优雅关闭
        if (!BindProcess.CloseMainWindow())
        {
            BindProcess.Kill(entireProcessTree: true);
        }
        else
        {
            BindProcess.WaitForExit(10000); // 等待最多10秒
            if (!BindProcess.HasExited)
            {
                BindProcess.Kill(entireProcessTree: true);
            }
        }
        BindProcess.WaitForExit();
        BindProcess.Close();
        BindProcess.Dispose();
        BindProcess = null;
    }
    /// <summary>
    /// 杀死进程
    /// </summary>
    protected virtual void KillProcess()
    {
        if (BindProcess == null) return;
        BindProcess.Kill(entireProcessTree: true);
        BindProcess.WaitForExit();
        BindProcess.Close();
        BindProcess.Dispose();
        BindProcess = null;
    }

    /// <summary>
    /// 获取运行参数
    /// </summary>
    /// <param name="model"></param>
    /// <param name="applicationType"></param>
    /// <returns></returns>
    protected async Task<string> GetRunParamsAsync(ApplicationRuntimeModel model, ApplicationTypeEnum applicationType)
    {
        using IServiceScope scope = MateralServices.ServiceProvider.CreateScope();
        IGlobalParameterRepository globalParameterRepository = scope.ServiceProvider.GetRequiredService<IGlobalParameterRepository>();
        List<GlobalParameter> globalParameters = await globalParameterRepository.FindAsync(m => m.ApplicationType == applicationType);

        List<string> runParams = [];
        if (model.ApplicationInfo.RunParams is not null && !string.IsNullOrWhiteSpace(model.ApplicationInfo.RunParams))
        {
            runParams.Add(model.ApplicationInfo.RunParams);
        }

        foreach (GlobalParameter globalParameter in globalParameters)
        {
            runParams.Add(globalParameter.Value);
        }

        return string.Join(" ", runParams);
    }

    /// <summary>
    /// 获取环境变量
    /// </summary>
    /// <param name="model"></param>
    /// <param name="applicationType"></param>
    /// <returns></returns>
    protected async Task<List<EnvironmentsModel>> GetEnvironmentsAsync(ApplicationRuntimeModel model, ApplicationTypeEnum applicationType)
    {
        using IServiceScope scope = MateralServices.ServiceProvider.CreateScope();
        IGlobalEnvironmentRepository globalEnvironmentRepository = scope.ServiceProvider.GetRequiredService<IGlobalEnvironmentRepository>();
        List<GlobalEnvironment> globalEnvironments = await globalEnvironmentRepository.FindAsync(m => m.ApplicationType == applicationType);

        List<EnvironmentsModel> environments = [];
        if (model.ApplicationInfo.RunParams is not null && !string.IsNullOrWhiteSpace(model.ApplicationInfo.Environments))
        {
            List<EnvironmentsModel> appEnvironments = model.ApplicationInfo.Environments.JsonToObject<List<EnvironmentsModel>>();
            environments.AddRange(appEnvironments);
        }

        foreach (GlobalEnvironment globalEnvironment in globalEnvironments)
        {
            environments.Add(new() { Key = globalEnvironment.Key, Value = globalEnvironment.Value });
        }

        return environments;
    }

    /// <summary>
    /// 获取工作目录
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    protected string GetWorkingDirectory(ApplicationRuntimeModel model) => Path.Combine(typeof(DeployServerModule).Assembly.GetDirectoryPath(), "Application", model.ApplicationInfo.RootPath);
}
