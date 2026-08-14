# restore.ps1 - restore a waikkal_erp SQL.gz backup into the Docker MySQL container.
#
# Usage:
#   powershell -File scripts/restore.ps1 -BackupPath .\backups\waikkal_erp_20260101_120000.sql.gz
#
param(
    [Parameter(Mandatory = $true)][string]$BackupPath,
    [string]$Container = "waikkal-mysql",
    [string]$MysqlUser = "root",
    [string]$MysqlPassword = "root",
    [string]$Database = "waikkal_erp",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupPath)) { Write-Error "Backup file not found: $BackupPath"; exit 1 }
if (-not $BackupPath.EndsWith(".gz")) {
    Write-Warning "Backup is not gzip; proceeding without decompression."
}

Write-Host "Restoring $BackupPath into container $Container / db $Database ..."
if ($DryRun) {
    Write-Host "[dry-run] Would run: docker exec -i $Container sh -c 'mysql -u$MysqlUser -p$MysqlPassword $Database' < decompressed dump"
    Write-Host "[dry-run] Done (no changes made)."
    exit 0
}

# Decompress and stream into mysql inside the container.
# mysql client accepts stdin; PowerShell pipes raw bytes via cmd for reliability.
cmd /c "gzip -dc `"$BackupPath`" | docker exec -i $Container mysql -u$MysqlUser -p$MysqlPassword $Database"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Restore failed (exit $LASTEXITCODE)"
    exit 1
}
Write-Host "Restore complete."
