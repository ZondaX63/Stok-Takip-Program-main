param(
  [string]$Version = "1.0.3",
  [string]$StackName = "stoktakip",
  [string]$Image = "zondaks/stoktakip-aio"
)
# Updates Portainer stack by editing compose file locally then printing next steps.
Write-Host "=== Update Instructions (Manual apply in Portainer UI) ===" -ForegroundColor Cyan
Write-Host "1. Push new image: $Image:$Version (already built & pushed)." 
Write-Host "2. In Portainer: Stacks -> $StackName -> Editor: set image tag to $Version" 
Write-Host "3. Click 'Update the stack'." 
Write-Host "4. Wait container recreate -> check /health." 
Write-Host "Rollback: change tag back to previous version and Update again." 
