$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "BaseCut NLE.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = '/c cd /d "L:\Projects\basecut" && start "BaseCut Server" cmd /c "npm run dev" && timeout /t 2 /nobreak >nul && start http://localhost:3000'
$Shortcut.WorkingDirectory = "L:\Projects\basecut"
$Shortcut.Description = "Launch BaseCut NLE - Dockview Workspace"
$Shortcut.WindowStyle = 7
$Shortcut.Save()

Write-Host "Created shortcut: $ShortcutPath"
