using Materal.EventBus.Abstraction;

namespace MateralReleaseCenter.ServerCenter.Abstractions.Events
{
    /// <summary>
    /// 项目删除事件
    /// </summary>
    public class ProjectDeleteEvent : IEvent
    {
        /// <summary>
        /// 项目名称
        /// </summary>
        public Guid ProjectID { get; set; }
    }
}