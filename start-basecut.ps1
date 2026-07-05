# Basecut NLE Launcher
# Opens the application when the dev server is ready

Write-Host "Starting Basecut NLE..." -ForegroundColor Green
Write-Host ""

# Change to project directory
Set-Location "L:\Projects\basecut"

# Start the dev server in background
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden

Write-Host "Waiting for server to start..." -ForegroundColor Yellow

# Wait for server to be ready (check for Vite ready message)
$maxWait = 30
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 1
    $waited++

    # Try to connect to localhost
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 1 -ErrorAction Stop
        $serverReady = $true
        Write-Host "Server is ready!" -ForegroundColor Green
    } catch {
        Write-Host "." -NoNewline
    }
}

if ($serverReady) {
    Write-Host ""
    Write-Host "Opening Basecut NLE in browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"

    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server when you're done" -ForegroundColor Yellow
    Write-Host ""

    # Keep the script running
    try {
        Wait-Process -Id $serverProcess.Id
    } catch [System.Management.Automation.PipelineStoppedException] {
        Write-Host ""
        Write-Host "Stopping Basecut NLE..." -ForegroundColor Red
        Stop-Process -Id $serverProcess.Id -Force
    }
} else {
    Write-Host ""
    Write-Host "Server failed to start. Check for errors above." -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}
