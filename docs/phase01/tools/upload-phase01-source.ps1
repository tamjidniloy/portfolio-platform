# DEVFOLIO OS: recover exact historical Phase 01 requirements source to existing GitHub draft PR.
# Windows PowerShell 5.1+; requires Git, configured GitHub credentials and the complete Phase 01 master ZIP.
# Preserve DRAFT status. This script NEVER marks the SRS approved or pushes directly to main.
param(
  [Parameter(Mandatory=$true)][string]$ArchivePath,
  [string]$WorkDir = (Join-Path $HOME 'Downloads\DEVFOLIO_Phase01_Recovery_Git')
)
$ErrorActionPreference = 'Stop'
$expectedSize = 82281
$expectedHash = '5f6030d6f2c7a6e6b3b8dd56be86216c84ebdd969dbece75a92b829c158adefd'
$branch = 'docs/phase01-requirements-recovery-20261023'
$repo = 'https://github.com/tamjidniloy/portfolio-platform.git'
$masterName = 'DEVFOLIO_OS_Phase_01_Complete_Requirements_Engineering.zip'
function Assert-Exit([string]$operation) {
  if ($LASTEXITCODE -ne 0) { throw "$operation failed, exit code $LASTEXITCODE" }
}
if (!(Test-Path -LiteralPath $ArchivePath -PathType Leaf)) { throw "Archive file not found: $ArchivePath" }
$source = Get-Item -LiteralPath $ArchivePath
if ($source.Length -ne $expectedSize) { throw "Incorrect source ZIP size: $($source.Length); expected $expectedSize" }
$actualHash = (Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualHash -ne $expectedHash) { throw "SHA-256 mismatch. Refusing altered source archive: $actualHash" }
Write-Host 'Phase 01 ZIP checksum verified.' -ForegroundColor Green
if (Test-Path -LiteralPath $WorkDir) { throw "WorkDir already exists; choose a NEW empty path: $WorkDir" }
$unpack = Join-Path ([System.IO.Path]::GetTempPath()) ("DevfolioPhase01_" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $unpack | Out-Null
try {
  Expand-Archive -LiteralPath $ArchivePath -DestinationPath $unpack -Force
  $root = Join-Path $unpack 'DEVFOLIO_OS_Phase_01_Requirements_Engineering_Master'
  $draft = Join-Path $root '01_CURRENT_HISTORICAL_DRAFT'
  $audit = Join-Path $root '02_REQUIREMENTS_AUDIT'
  $original = Join-Path $root '00_ORIGINAL_ARCHIVES'
  $expectedSrs = Join-Path $draft 'docs\SRS.md'
  if (!(Test-Path -LiteralPath $expectedSrs)) { throw 'SRS draft missing from expected extracted folder.' }
  $srsText = Get-Content -LiteralPath $expectedSrs -Raw
  if ($srsText -notmatch '1\.0 Draft' -or $srsText -notmatch 'Not approved') {
    throw 'Source SRS did not match expected DRAFT approval language. Review manually.'
  }
  & git --version; Assert-Exit 'git version'
  & git clone --branch $branch --single-branch $repo $WorkDir
  Assert-Exit 'git clone'
  Push-Location $WorkDir
  try {
    $target = 'docs/phase01'
    $draftTarget = Join-Path $target 'draft'
    $traceTarget = Join-Path $target 'traceability'
    $archiveTarget = Join-Path $target 'source_archives'
    New-Item -ItemType Directory -Force -Path $draftTarget,$traceTarget,$archiveTarget | Out-Null
    # Copy extracted draft source files and folders without renaming them.
    Get-ChildItem -LiteralPath $draft -Force | ForEach-Object {
      Copy-Item -LiteralPath $_.FullName -Destination $draftTarget -Recurse -Force
    }
    foreach($file in @('REQUIREMENT_TEST_TRACEABILITY.csv','PROPOSED_MISSING_ACCEPTANCE_TESTS.csv','REQUIREMENTS_METADATA.json','PHASE02_CHANGE_IMPACT.md','COVERAGE_AUDIT.md','ORIGINAL_ARCHIVES_INTEGRITY.json')) {
      Copy-Item -LiteralPath (Join-Path $audit $file) -Destination $traceTarget -Force
    }
    Get-ChildItem -LiteralPath $original -File | ForEach-Object {
      Copy-Item -LiteralPath $_.FullName -Destination $archiveTarget -Force
    }
    Copy-Item -LiteralPath $ArchivePath -Destination (Join-Path $archiveTarget $masterName) -Force
    & git add -- docs/phase01/draft docs/phase01/traceability docs/phase01/source_archives
    Assert-Exit 'git add'
    & git diff --cached --stat; Assert-Exit 'git staged stat'
    & git status --short; Assert-Exit 'git status'
    & git commit -m 'docs: add original historical Phase 01 requirements sources and traceability'
    Assert-Exit 'git commit'
    & git push origin $branch
    Assert-Exit 'git push'
    Write-Host 'Pushed Phase 01 source drafts to the existing PR branch.' -ForegroundColor Green
    Write-Host 'Review PRs: https://github.com/tamjidniloy/portfolio-platform/pulls'
    Write-Host 'Important: authoritative approved SRS is STILL NOT VERIFIED.'
  } finally { Pop-Location }
} finally {
  if (Test-Path -LiteralPath $unpack) { Remove-Item -LiteralPath $unpack -Recurse -Force -ErrorAction SilentlyContinue }
}
