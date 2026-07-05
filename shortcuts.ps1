# Create both desktop shortcuts

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")

# Create main launcher shortcut
$Shortcut1 = $WshShell.CreateShortcut("$DesktopPath\Basecut NLE.lnk")
$Shortcut1.TargetPath = "L:\Projects\basecut\start-basecut.ps1"
$Shortcut1.WorkingDirectory = "L:\Projects\basecut"
$Shortcut1.Description = "Launch Basecut NLE - Command Pattern Bio-Sequence Editor"
$Shortcut1.IconLocation = "%SystemRoot%\System32\shell32.dll,27"
$Shortcut1.Save()

# Create quick open shortcut
$Shortcut2 = $WshShell.CreateShortcut("$DesktopPath\Open Basecut NLE.lnk")
$Shortcut2.TargetPath = "L:\Projects\basecut\open-basecut.bat"
$Shortcut2.WorkingDirectory = "L:\Projects\basecut"
$Shortcut2.Description = "Quick open Basecut NLE in browser"
$Shortcut2.IconLocation = "%SystemRoot%\System32\shell32.dll,14"
$Shortcut2.Save()

Write-Host "Desktop shortcuts created:" -ForegroundColor Green
Write-Host "  - Basecut NLE.lnk (starts server and opens app)" -ForegroundColor Cyan
Write-Host "  - Open Basecut NLE.lnk (quick browser open only)" -ForegroundColor Cyan
