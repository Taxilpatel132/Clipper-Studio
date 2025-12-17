# Move Clipper Studio project outside OneDrive for better performance

$sourcePath = "C:\Users\HP\OneDrive\Desktop\Clipper Studio"
$destPath = "C:\Projects\Clipper Studio"

Write-Host "🚀 Setting up local development environment..." -ForegroundColor Cyan
Write-Host ""

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ Source path not found: $sourcePath" -ForegroundColor Red
    exit 1
}

# Create destination if it doesn't exist
if (-not (Test-Path $destPath)) {
    Write-Host "📁 Creating directory: $destPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
}

# Copy project files (excluding node_modules and other large folders)
Write-Host "📦 Copying project files (this may take a moment)..." -ForegroundColor Yellow

try {
    # Use robocopy for efficient copying, excluding certain directories
    $excludeDirs = @("node_modules", ".next", "outputs", "frames", ".git")
    $excludeFiles = @("*.log")
    
    $robocopyArgs = @(
        $sourcePath,
        $destPath,
        "/MIR",  # Mirror directory
        "/XD", ($excludeDirs -join " "),  # Exclude directories
        "/XF", ($excludeFiles -join " "),  # Exclude files
        "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np"  # Minimal output
    )
    
    Start-Process -FilePath "robocopy.exe" -ArgumentList $robocopyArgs -Wait -NoNewWindow
    
    Write-Host "✅ Project copied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 New location: $destPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. cd `"$destPath\Back-end`"" -ForegroundColor White
    Write-Host "  2. npm install" -ForegroundColor White
    Write-Host "  3. node test-render.js" -ForegroundColor White
    Write-Host ""
    Write-Host "  Also for Front-end:" -ForegroundColor White
    Write-Host "  1. cd `"$destPath\Front-end`"" -ForegroundColor White
    Write-Host "  2. npm install" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during copy: $_" -ForegroundColor Red
    exit 1
}
