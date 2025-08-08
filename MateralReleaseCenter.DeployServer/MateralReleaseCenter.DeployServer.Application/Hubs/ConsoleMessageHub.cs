using Microsoft.AspNetCore.SignalR;

namespace MateralReleaseCenter.DeployServer.Application.Hubs
{
    /// <summary>
    /// 控制台消息Hub
    /// </summary>
    public class ConsoleMessageHub : Hub<IConsoleMessageHub>
    {
    }
}
