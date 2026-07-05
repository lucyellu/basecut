$port = 3000

# Find processes listening on the specific port
$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($connections) {
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        if ($pidToKill -ne 0 -and $pidToKill -ne 4) {
            Write-Host "Found Ghost Server on Port $port (PID: $pidToKill). Terminating..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host "Starting BaseCut Server on fresh port..." -ForegroundColor Green
npm run dev
