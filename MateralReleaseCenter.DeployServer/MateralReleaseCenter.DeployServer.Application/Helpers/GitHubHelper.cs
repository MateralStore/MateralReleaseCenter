using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace MateralReleaseCenter.DeployServer.Application.Helpers;

/// <summary>
/// GitHub帮助类
/// </summary>
public static partial class GitHubHelper
{
    /// <summary>
    /// 下载最新的ReleasesFile
    /// </summary>
    /// <param name="httpClientFactory"></param>
    /// <param name="rootPath"></param>
    /// <param name="repositoryUrl"></param>
    /// <param name="token"></param>
    /// <returns></returns>
    public static async Task<string> DownloadLastReleasesFileAsync(IHttpClientFactory httpClientFactory, string rootPath, string repositoryUrl, string? token)
    {
        string tempPath = Path.Combine(Path.GetTempPath(), $"MRCDownloads");
        return await DownloadLastReleasesFileAsync(httpClientFactory, rootPath, repositoryUrl, token, tempPath);
    }
    /// <summary>
    /// 下载最新的ReleasesFile
    /// </summary>
    /// <param name="httpClientFactory"></param>
    /// <param name="rootPath"></param>
    /// <param name="repositoryUrl"></param>
    /// <param name="token"></param>
    /// <param name="saveDirectoryPath"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    public static async Task<string> DownloadLastReleasesFileAsync(IHttpClientFactory httpClientFactory, string rootPath, string repositoryUrl, string? token, string saveDirectoryPath)
    {
        // 获取 HTTP 客户端
        using var httpClient = httpClientFactory.CreateClient();
        // 设置请求头
        httpClient.DefaultRequestHeaders.Add("User-Agent", "MateralReleaseCenter");

        // 如果有 Token，添加到请求头（用于API请求）
        if (!string.IsNullOrWhiteSpace(token))
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        // 转换仓库 URL 为 GitHub API URL
        string apiUrl = ConvertToGitHubApiUrl(repositoryUrl);

        // 获取最新 Release 信息
        HttpResponseMessage response = await httpClient.GetAsync($"{apiUrl}/releases/latest");
        response.EnsureSuccessStatusCode();

        string json = await response.Content.ReadAsStringAsync();
        GitHubReleaseResponse? releaseInfo = JsonSerializer.Deserialize<GitHubReleaseResponse>(json);

        // 找到匹配的发布文件
        GitHubAssetResponse asset = (releaseInfo?.Assets?.FirstOrDefault(m => m.Name.StartsWith(rootPath))) ?? throw new Exception("该 Release 没有可下载的文件");

        // 使用GitHub API下载asset（私有仓库需要这种方式）
        string downloadUrl = $"{apiUrl}/releases/assets/{asset.Id}";
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/octet-stream"));
        string savePath = Path.Combine(saveDirectoryPath, asset.Name);
        // 检查文件是否已存在
        if (File.Exists(savePath))return savePath;
        string? directoryPath = Path.GetDirectoryName(savePath);
        if (!string.IsNullOrEmpty(directoryPath) && !Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }
        HttpResponseMessage downloadResponse = await httpClient.GetAsync(downloadUrl);
        downloadResponse.EnsureSuccessStatusCode();

        await using FileStream fs = new(savePath, FileMode.Create);
        await downloadResponse.Content.CopyToAsync(fs);

        return savePath;
    }

    private static string ConvertToGitHubApiUrl(string repositoryUrl)
    {
        // https://github.com/user/repo -> https://api.github.com/repos/user/repo
        Match match = ReposRegex().Match(repositoryUrl);
        if (match.Success)
        {
            return $"https://api.github.com/repos/{match.Groups[1].Value}/{match.Groups[2].Value}";
        }
        return repositoryUrl;
    }

    /// <summary>
    /// GitHub Release 响应模型
    /// </summary>
    private class GitHubReleaseResponse
    {
        [JsonPropertyName("assets")]
        public List<GitHubAssetResponse>? Assets { get; set; }
    }

    /// <summary>
    /// GitHub Release Asset 响应模型
    /// </summary>
    private class GitHubAssetResponse
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("browser_download_url")]
        public string BrowserDownloadUrl { get; set; } = string.Empty;
    }

    [GeneratedRegex(@"github\.com[/:]([^/]+)/([^/.]+)")]
    private static partial Regex ReposRegex();
}
