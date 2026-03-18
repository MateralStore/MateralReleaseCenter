using MateralReleaseCenter.DeployServer.Abstractions.DTO.ApplicationInfo;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace MateralReleaseCenter.DeployServer.Application.Services.ApplicationHandlers;

/// <summary>
/// ProcessStartInfo 帮助类
/// </summary>
public static class ProcessStartInfoHelper
{
    /// <summary>
    /// 创建 ProcessStartInfo
    /// </summary>
    /// <param name="fileName">可执行文件名</param>
    /// <param name="arguments">参数</param>
    /// <param name="workingDirectory">工作目录</param>
    /// <param name="environments">环境变量</param>
    /// <param name="createNoWindow">是否创建窗口，默认 true</param>
    /// <param name="showMinimizedOnWindows">在 Windows 上是否最小化窗口，默认 false</param>
    /// <returns></returns>
    public static ProcessStartInfo Create(
        string fileName,
        string arguments,
        string workingDirectory,
        List<EnvironmentDTO> environments,
        bool createNoWindow = true,
        bool showMinimizedOnWindows = false)
    {
        ProcessStartInfo processStartInfo = new()
        {
            FileName = fileName,
            Arguments = arguments,
            UseShellExecute = false,
            CreateNoWindow = createNoWindow,
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8,
            WorkingDirectory = workingDirectory
        };
        foreach (EnvironmentDTO item in environments)
        {
            if (item.Key is null) continue;
            processStartInfo.Environment.TryAdd(item.Key, item.Value);
        }

        if (showMinimizedOnWindows && RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            processStartInfo.WindowStyle = ProcessWindowStyle.Minimized;
        }

        return processStartInfo;
    }
}
