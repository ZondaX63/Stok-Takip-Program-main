param(
  [string]$FrontendUrl = "http://localhost:8080",
  [string]$ApiBase = "http://localhost:5000/api"
)

Write-Host "== Backend health kontrolu =="
try { (Invoke-WebRequest -Uri ($ApiBase -replace '/api$','') + '/health' -UseBasicParsing).Content | Write-Host } catch { Write-Warning $_ }

$company = "TestCo$(Get-Random -Maximum 9999)"
$email = "admin$((Get-Random -Maximum 9999))@testco.local"

$registerBody = @{
  companyName = $company
  name        = 'Admin User'
  email       = $email
  password    = 'Admin123!'
} | ConvertTo-Json

Write-Host "== Kayıt isteği (frontend proxy) =="
$registerResp = $null
try {
  $registerResp = Invoke-RestMethod -Uri "$FrontendUrl/api/auth/register" -Method Post -Body $registerBody -ContentType 'application/json'
  ($registerResp | ConvertTo-Json -Depth 4) | Write-Host
} catch { Write-Warning $_ }

if(-not $registerResp.token){ Write-Warning "Token alınamadı, test durduruluyor"; exit 1 }
$token = $registerResp.token

Write-Host "== /api/auth/me kontrolü (backend direkt) =="
$me = Invoke-RestMethod -Uri "$ApiBase/auth/me" -Headers @{ 'x-auth-token' = $token } -Method Get
($me | ConvertTo-Json -Depth 4) | Write-Host

Write-Host "== /api/products listeleme =="
try { (Invoke-RestMethod -Uri "$ApiBase/products" -Headers @{ 'x-auth-token' = $token } -Method Get | ConvertTo-Json -Depth 4) | Write-Host } catch { Write-Warning $_ }

Write-Host "== Test tamamlandı =="
