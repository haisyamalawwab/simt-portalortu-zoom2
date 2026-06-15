# SIMT Portal Ortu - Repository Cleanup Script
# PowerShell version for Windows/Laragon
# Run from repository root: .\cleanup.ps1

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SIMT Portal Repository Cleanup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if in git repository
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Confirm cleanup
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Update .gitignore" -ForegroundColor White
Write-Host "  2. Remove generator scripts" -ForegroundColor White
Write-Host "  3. Remove runtime files" -ForegroundColor White
Write-Host "  4. Organize reference materials" -ForegroundColor White
Write-Host "  5. Archive Laravel reference" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cleanup cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Starting cleanup process..." -ForegroundColor Green
Write-Host ""

# Phase 1: Update .gitignore
Write-Host "[1/8] Updating .gitignore..." -ForegroundColor Cyan
$gitignoreContent = @"

# Development database
db/*.db
db/*.db-*

# Runtime files
*.pid

# Archive folder
docs-archive/
"@

Add-Content -Path ".gitignore" -Value $gitignoreContent
Write-Host "  OK - .gitignore updated" -ForegroundColor Green

# Phase 2: Remove from git tracking
Write-Host "[2/8] Removing tracked files..." -ForegroundColor Cyan
$filesToUntrack = @("db\custom.db", ".zscripts\dev.pid")

foreach ($file in $filesToUntrack) {
    if (Test-Path $file) {
        git rm --cached $file 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK - Removed from tracking: $file" -ForegroundColor Green
        } else {
            Write-Host "  SKIP - File not tracked: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  SKIP - File not found: $file" -ForegroundColor Gray
    }
}

# Phase 3: Delete unnecessary files
Write-Host "[3/8] Removing unnecessary files..." -ForegroundColor Cyan
$filesToDelete = @(
    "download\generate_prd.js",
    "download\generate_prd_v2.js",
    "download\README.md"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  OK - Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  SKIP - Not found: $file" -ForegroundColor Gray
    }
}

# Phase 4: Create archive folder
Write-Host "[4/8] Creating archive structure..." -ForegroundColor Cyan
if (-not (Test-Path "docs-archive")) {
    New-Item -ItemType Directory -Path "docs-archive" | Out-Null
    Write-Host "  OK - Created docs-archive folder" -ForegroundColor Green
} else {
    Write-Host "  SKIP - docs-archive already exists" -ForegroundColor Yellow
}

# Phase 5: Move PRD documents
Write-Host "[5/8] Moving reference materials..." -ForegroundColor Cyan
$docxFiles = Get-ChildItem "download\*.docx" -ErrorAction SilentlyContinue
if ($docxFiles) {
    foreach ($file in $docxFiles) {
        Move-Item $file.FullName "docs-archive\" -Force
        Write-Host "  OK - Moved: $($file.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "  SKIP - No .docx files to move" -ForegroundColor Gray
}

# Move visualizations
if (Test-Path "download\simt-visualisasi") {
    Move-Item "download\simt-visualisasi" "docs-archive\" -Force
    Write-Host "  OK - Moved: simt-visualisasi folder" -ForegroundColor Green
} else {
    Write-Host "  SKIP - simt-visualisasi not found" -ForegroundColor Gray
}

# Phase 6: Handle Laravel reference
Write-Host "[6/8] Processing Laravel reference..." -ForegroundColor Cyan
if (Test-Path "download\simt-laravel") {
    Write-Host "  Laravel reference found (30MB)" -ForegroundColor Yellow
    $archiveLaravel = Read-Host "  Archive to zip? (y/N)"
    
    if ($archiveLaravel -eq "y" -or $archiveLaravel -eq "Y") {
        $zipPath = "docs-archive\simt-laravel-reference.zip"
        Write-Host "  Creating archive..." -ForegroundColor Yellow
        
        Compress-Archive -Path "download\simt-laravel\*" -DestinationPath $zipPath -Force
        Write-Host "  OK - Created: $zipPath" -ForegroundColor Green
        
        $removeLaravel = Read-Host "  Remove original? (y/N)"
        if ($removeLaravel -eq "y" -or $removeLaravel -eq "Y") {
            Remove-Item "download\simt-laravel" -Recurse -Force
            Write-Host "  OK - Removed original folder" -ForegroundColor Green
        } else {
            Write-Host "  SKIP - Keeping original" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  SKIP - Laravel archiving skipped" -ForegroundColor Yellow
    }
} else {
    Write-Host "  SKIP - Laravel reference not found" -ForegroundColor Gray
}

# Phase 7: Move deployment configs
Write-Host "[7/8] Organizing deployment configs..." -ForegroundColor Cyan
if (-not (Test-Path "deployment")) {
    New-Item -ItemType Directory -Path "deployment" | Out-Null
    Write-Host "  OK - Created deployment folder" -ForegroundColor Green
}

if (Test-Path "Caddyfile") {
    Move-Item "Caddyfile" "deployment\" -Force
    Write-Host "  OK - Moved: Caddyfile" -ForegroundColor Green
} else {
    Write-Host "  SKIP - Caddyfile not found" -ForegroundColor Gray
}

# Phase 8: Git commit
Write-Host "[8/8] Git operations..." -ForegroundColor Cyan
git add .gitignore
git add -A

$doCommit = Read-Host "Commit changes? (y/N)"
if ($doCommit -eq "y" -or $doCommit -eq "Y") {
    git commit -m "chore: repository cleanup - remove z.ai artifacts"
    Write-Host "  OK - Changes committed" -ForegroundColor Green
} else {
    Write-Host "  SKIP - Changes staged but not committed" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Cleanup Completed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - .gitignore updated" -ForegroundColor White
Write-Host "  - Generator scripts removed" -ForegroundColor White
Write-Host "  - Reference materials organized" -ForegroundColor White
Write-Host "  - Deployment configs moved" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update src/app/layout.tsx (remove z.ai branding)" -ForegroundColor White
Write-Host "  2. Check: grep -r 'z-ai-web-dev-sdk' src/" -ForegroundColor White
Write-Host "  3. If not used: bun remove z-ai-web-dev-sdk" -ForegroundColor White
Write-Host "  4. Test: bun run dev" -ForegroundColor White
Write-Host "  5. Review: DEV_REPORT.md" -ForegroundColor White
Write-Host ""
Write-Host "Repository is cleaner and more production-ready!" -ForegroundColor Green
Write-Host ""
