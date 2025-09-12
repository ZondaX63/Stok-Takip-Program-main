param(
  [string]$Version = "1.0.0",
  [string]$Repo = "zondaks/stoktakip-aio",
  [switch]$Push
)
$ErrorActionPreference='Stop'
Write-Host "== Building AIO image ${Repo}:${Version} =="

docker build -f Dockerfile.aio -t "${Repo}:${Version}" -t "${Repo}:latest" .

Write-Host "== Saving TAR =="
New-Item -ItemType Directory -Path .dist -Force | Out-Null
$tarPath = ".dist/stoktakip-aio_${Version}.tar"
docker save -o $tarPath "${Repo}:${Version}"
Get-FileHash $tarPath -Algorithm SHA256 | Select-Object Hash, Path

if($Push){
  Write-Host "== Pushing ${Repo}:${Version} & latest =="
  docker push "${Repo}:${Version}"
  docker push "${Repo}:latest"
}

Write-Host "Done."
