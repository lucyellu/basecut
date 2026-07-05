# Create Desktop Shortcut for Basecut NLE

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Basecut NLE.lnk"
$TargetPath = "L:\Projects\basecut\start-basecut.ps1"
$WorkingDirectory = "L:\Projects\basecut"
$Description = "Launch Basecut NLE - Command Pattern Bio-Sequence Editor"
$IconLocation = "%SystemRoot%\System32\shell32.dll,27"

# Create the shortcut
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $WorkingDirectory
$Shortcut.Description = $Description
$Shortcut.IconLocation = $IconLocation

# Save the shortcut
$Shortcut.Save()

Write-Host "Desktop shortcut created: $ShortcutPath" -ForegroundColor Green
Write-Host "You can now double-click 'Basecut NLE' on your desktop to launch the app!" -ForegroundColor Cyan
