param(
  [string]$Version = "1.0.0",
  [string]$Repo = "stoktakip/monolith",
  [switch]$Push,
  [string]$RemoteRepo = "zondaks/stoktakip-monolith"
)
$ErrorActionPreference='Stop'
Write-Host "== Building monolith image ${Repo}:${Version} =="

docker build -t "${Repo}:${Version}" -t "${Repo}:latest" .

Write-Host "== Saving TAR =="
New-Item -ItemType Directory -Path .dist -Force | Out-Null
$tarPath = ".dist/stoktakip-monolith_${Version}.tar"
docker save -o $tarPath "${Repo}:${Version}"
Get-FileHash $tarPath -Algorithm SHA256 | Select-Object Hash, Path

if($Push){
  Write-Host "== Tag & Push to $RemoteRepo =="
  docker tag "${Repo}:${Version}" "${RemoteRepo}:${Version}"
  docker tag "${Repo}:latest" "${RemoteRepo}:latest"
  docker push "${RemoteRepo}:${Version}"
  docker push "${RemoteRepo}:latest"
}

Write-Host "Done."
