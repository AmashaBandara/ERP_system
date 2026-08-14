# backup.ps1 - dump waikkal_erp via Docker MySQL to a local directory,
# with retention and optional S3-compatible cloud upload.
#
# Usage:
#   powershell -File scripts/backup.ps1 -Database waikkal_erp -OutDir .\backups
#   powershell -File scripts/backup.ps1 -KeepLocal 30 -Cloud -S3Bucket my-bucket -S3Endpoint https://... -S3Profile default
#
# Parameters (all optional with sensible defaults):
param(
    [string]$Database = "waikkal_erp",
    [string]$OutDir = ".\backups",
    [int]$KeepLocal = 30,
    [string]$Container = "waikkal-mysql",
    [string]$MysqlUser = "root",
    [string]$MysqlPassword = "root",
    [switch]$Cloud,
    [string]$S3Bucket = "",
    [string]$S3Endpoint = "",
    [string]$S3Profile = "default"
)

$ErrorActionPreference = "Stop"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$file = Join-Path $OutDir ("{0}_{1}.sql.gz" -f $Database, $stamp)
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

Write-Host "Backing up $Database to $file ..."
# mysqldump inside the container, compress with gzip on the host
docker exec $Container sh -c "mysqldump -u$MysqlUser -p$MysqlPassword --single-transaction --routines --triggers $Database" |
    gzip -c > $file

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backup failed (exit $LASTEXITCODE)"
    exit 1
}
Write-Host "Backup complete: $file"

# Local retention
$old = Get-ChildItem -Path $OutDir -Filter "*_*.sql.gz" | Sort-Object LastWriteTime -Descending | Select-Object -Skip $KeepLocal
foreach ($o in $old) {
    Remove-Item $o.FullName -Force
    Write-Host "Pruned $($o.Name)"
}

# Cloud upload (S3-compatible) - requires aws cli
if ($Cloud) {
    if (-not $S3Bucket) { Write-Warning "Cloud requested but S3Bucket not provided; skipping." }
    else {
        $args = @("s3", "cp", $file, "s3://$S3Bucket/$($file | Split-Path -Leaf)", "--profile", $S3Profile)
        if ($S3Endpoint) { $args += @("--endpoint-url", $S3Endpoint) }
        aws @args
        if ($LASTEXITCODE -ne 0) { Write-Warning "Cloud upload reported a non-zero exit." }
        else { Write-Host "Uploaded to s3://$S3Bucket" }
    }
}

Write-Host "Done."
