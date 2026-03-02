# 发布脚本
$publishPath = "..\Publish"

# 确保发布目录存在
if (-not (Test-Path $publishPath)) {
    New-Item -ItemType Directory -Path $publishPath -Force | Out-Null
}

# 发布 DeployServer.WebAPI
Write-Host "正在发布 DeployServer.WebAPI..."
dotnet publish "MateralReleaseCenter.DeployServer\MateralReleaseCenter.DeployServer.WebAPI\MateralReleaseCenter.DeployServer.WebAPI.csproj" -o "$publishPath\MateralReleaseCenter\MateralReleaseCenter.DeployServer" -c Release

# 发布 EnvironmentServer.WebAPI
Write-Host "正在发布 EnvironmentServer.WebAPI..."
dotnet publish "MateralReleaseCenter.EnvironmentServer\MateralReleaseCenter.EnvironmentServer.WebAPI\MateralReleaseCenter.EnvironmentServer.WebAPI.csproj" -o "$publishPath\MateralReleaseCenter\MateralReleaseCenter.EnvironmentServer" -c Release

# 发布 ServerCenter.WebAPI
Write-Host "正在发布 ServerCenter.WebAPI..."
dotnet publish "MateralReleaseCenter.ServerCenter\MateralReleaseCenter.ServerCenter.WebAPI\MateralReleaseCenter.ServerCenter.WebAPI.csproj" -o "$publishPath\MateralReleaseCenter\MateralReleaseCenter.ServerCenter" -c Release

Write-Host "发布完成！"
