param(
  [string]$Version = "latest"
)

$ErrorActionPreference = 'Stop'

Write-Host "== Building images (tag: $Version) =="
# Build with compose so build contexts & tags apply
$env:BACKEND_IMAGE="stoktakip/backend:$Version"
$env:FRONTEND_IMAGE="stoktakip/frontend:$Version"

docker compose build

Write-Host "== Tag normalization =="
docker tag stoktakip/backend:latest stoktakip/backend:$Version
docker tag stoktakip/frontend:latest stoktakip/frontend:$Version

New-Item -ItemType Directory -Path .dist -Force | Out-Null

$backendTar = ".dist/stoktakip-backend_$Version.tar"
$frontendTar = ".dist/stoktakip-frontend_$Version.tar"

Write-Host "== Saving TAR files =="
docker save -o $backendTar stoktakip/backend:$Version
Write-Host "Saved $backendTar"
docker save -o $frontendTar stoktakip/frontend:$Version
Write-Host "Saved $frontendTar"

Write-Host "== SHA256 checksums =="
Get-FileHash $backendTar -Algorithm SHA256 | Select-Object Hash, Path
Get-FileHash $frontendTar -Algorithm SHA256 | Select-Object Hash, Path

Write-Host "== DONE =="
