# Stop all node processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to stop
Start-Sleep -Seconds 3

# Remove .next directory with force
Write-Host "Removing .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Verify it's deleted
if (Test-Path ".next") {
    Write-Host "Warning: .next still exists, trying alternative method..." -ForegroundColor Red
    cmd /c "rmdir /s /q .next"
    Start-Sleep -Seconds 2
}

# Build
Write-Host "Starting build..." -ForegroundColor Green
npm run build
