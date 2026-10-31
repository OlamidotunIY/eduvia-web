[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$hostsPath = Join-Path $env:WINDIR 'System32\drivers\etc\hosts'
$requiredHosts = @('app.eduvia.name.ng', 'api.eduvia.name.ng')

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($currentIdentity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Run PowerShell as Administrator, then run: pwsh -File scripts/setup-local-domain.ps1'
}

$hostsContent = Get-Content -LiteralPath $hostsPath -Raw
foreach ($hostName in $requiredHosts) {
  if ($hostsContent -notmatch "(?m)^\s*127\.0\.0\.1\s+.*\b$([regex]::Escape($hostName))\b") {
    Add-Content -LiteralPath $hostsPath -Value "127.0.0.1 $hostName"
  }
}

if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
  throw 'Install mkcert, run "mkcert -install", then run this script again.'
}

New-Item -ItemType Directory -Force -Path certs | Out-Null
mkcert -install
mkcert -key-file "certs/app.eduvia.name.ng-key.pem" -cert-file "certs/app.eduvia.name.ng.pem" app.eduvia.name.ng

Write-Host 'Local domain configured. Run: pnpm dev:domain'
Write-Host 'Open: https://app.eduvia.name.ng:5173'
