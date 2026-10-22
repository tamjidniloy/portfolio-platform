# DEVFOLIO OS — Phase 02 master archive uploader for Windows PowerShell 5.1+
# Requires installed Git, Git LFS, working GitHub authentication, and the original archive downloaded from project conversation.
# This script changes ONLY a newly cloned local checkout and the existing Phase 02 asset PR branch.
param(
  [Parameter(Mandatory=$true)]
  [string]$ArchivePath,
  [string]$WorkDir = (Join-Path $HOME 'Downloads\DEVFOLIO_Phase02_GitHub_Assets')
)
$ErrorActionPreference = 'Stop'
$repo = 'https://github.com/tamjidniloy/portfolio-platform.git'
$branch = 'archive/phase02-main-sync-and-design-assets-20261023'
$name = 'DEVFOLIO_OS_Phase_02_00_to_02_14_COMPLETE_MASTER.zip'
$sha256 = '3a7d0432f2d3c494dd1fec755d9929d040e814a575d00a9578a8d3db30391869'
$size = 53312288

function Check-LastExit([string]$operation) {
  if ($LASTEXITCODE -ne 0) { throw "$operation failed, exit code $LASTEXITCODE" }
}
if (!(Test-Path -LiteralPath $ArchivePath -PathType Leaf)) { throw "Archive not found: $ArchivePath" }
$f = Get-Item -LiteralPath $ArchivePath
if ($f.Length -ne $size) { throw "Incorrect archive byte count: $($f.Length); expected $size" }
$actual = (Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $sha256) { throw "Checksum mismatch! Refusing upload. Found $actual" }
Write-Host 'Archive SHA-256 verified.' -ForegroundColor Green

& git --version; Check-LastExit 'git --version'
& git lfs version; Check-LastExit 'git lfs version'
if (Test-Path -LiteralPath $WorkDir) { throw "Refusing to reuse existing WorkDir: $WorkDir. Choose a fresh directory." }
& git clone --branch $branch --single-branch $repo $WorkDir
Check-LastExit 'git clone'
Push-Location $WorkDir
try {
  & git lfs install --local; Check-LastExit 'git lfs install'
  & git lfs track 'design/phase02/archive/*.zip'; Check-LastExit 'git lfs track'
  $destDir = 'design/phase02/archive'
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  Copy-Item -LiteralPath $ArchivePath -Destination (Join-Path $destDir $name)
  & git add .gitattributes (Join-Path $destDir $name)
  Check-LastExit 'git add'
  & git diff --cached --stat; Check-LastExit 'git diff'
  & git commit -m 'assets: store Phase 02 complete verified archive via Git LFS'
  Check-LastExit 'git commit'
  & git lfs ls-files; Check-LastExit 'git lfs ls-files'
  & git push origin $branch
  Check-LastExit 'git push'
  Write-Host 'Uploaded master archive through Git LFS to the existing Phase 02 PR branch.' -ForegroundColor Green
  Write-Host 'Verify: https://github.com/tamjidniloy/portfolio-platform/pulls'
}
finally { Pop-Location }
