# 发布脚本
$publishPath = "..\Publish"

# 确保发布目录存在
if (-not (Test-Path $publishPath)) {
    New-Item -ItemType Directory -Path $publishPath -Force | Out-Null
}

# 清理旧的发文件夹
$materalReleaseCenterPath = Join-Path $publishPath "MateralReleaseCenter"
if (Test-Path $materalReleaseCenterPath) {
    Write-Host "正在清理旧的发文件夹..."
    Remove-Item -Path $materalReleaseCenterPath -Recurse -Force
}

# 发布 DeployServer.WebAPI
Write-Host "正在发布 DeployServer.WebAPI..."
dotnet publish "MateralReleaseCenter.DeployServer\MateralReleaseCenter.DeployServer.WebAPI\MateralReleaseCenter.DeployServer.WebAPI.csproj" -o "$publishPath\MateralReleaseCenter\DeployServer" -c Release -f net10.0

# 发布 EnvironmentServer.WebAPI
Write-Host "正在发布 EnvironmentServer.WebAPI..."
dotnet publish "MateralReleaseCenter.EnvironmentServer\MateralReleaseCenter.EnvironmentServer.WebAPI\MateralReleaseCenter.EnvironmentServer.WebAPI.csproj" -o "$publishPath\MateralReleaseCenter\EnvironmentServer" -c Release -f net10.0

# 发布 ServerCenter.WebAPI
Write-Host "正在发布 ServerCenter.WebAPI..."
dotnet publish "MateralReleaseCenter.ServerCenter\MateralReleaseCenter.ServerCenter.WebAPI\MateralReleaseCenter.ServerCenter.WebAPI.csproj" -o "$publishPath\MateralReleaseCenter\ServerCenter" -c Release -f net10.0

# 压缩发布的文件夹
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$zipFileName = "MateralReleaseCenter$timestamp.zip"
$zipPath = Join-Path $materalReleaseCenterPath $zipFileName

Write-Host "正在压缩到 $zipFileName..."
Compress-Archive -Path "$publishPath\MateralReleaseCenter\*" -DestinationPath $zipPath -Force

Write-Host "压缩完成！压缩文件: $zipPath"
