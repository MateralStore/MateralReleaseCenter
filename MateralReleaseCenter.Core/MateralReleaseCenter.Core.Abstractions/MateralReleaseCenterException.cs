namespace MateralReleaseCenter.Core.Abstractions
{
    /// <summary>
    /// MateralReleaseCenter异常
    /// </summary>
    public class MateralReleaseCenterException : MergeBlockModuleException
    {
        /// <summary>
        /// MateralReleaseCenter异常
        /// </summary>
        public MateralReleaseCenterException()
        {
        }
        /// <summary>
        /// MateralReleaseCenter异常
        /// </summary>
        /// <param name="message"></param>
        public MateralReleaseCenterException(string message) : base(message)
        {
        }
        /// <summary>
        /// MateralReleaseCenter异常
        /// </summary>
        /// <param name="message"></param>
        /// <param name="innerException"></param>
        public MateralReleaseCenterException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}