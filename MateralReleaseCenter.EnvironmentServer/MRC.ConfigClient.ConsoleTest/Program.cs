using Materal.MergeBlock;

namespace MRC.ConfigClient.ConsoleTest;

internal class Program
{
    static async Task Main(string[] args)
    {
        await MergeBlockProgram.RunAsync(args);
    }
}
