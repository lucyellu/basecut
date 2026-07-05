@echo off
REM Create desktop shortcuts for Basecut NLE

echo Creating desktop shortcuts...

powershell -ExecutionPolicy Bypass -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; ^
$DesktopPath = [Environment]::GetFolderPath('Desktop'); ^
$Shortcut = $WshShell.CreateShortcut($DesktopPath + '\Basecut NLE.lnk'); ^
$Shortcut.TargetPath = 'L:\Projects\basecut\start-basecut.ps1'; ^
$Shortcut.WorkingDirectory = 'L:\Projects\basecut'; ^
$Shortcut.Description = 'Launch Basecut NLE - Command Pattern Bio-Sequence Editor'; ^
$Shortcut.IconLocation = '%SystemRoot%\System32\shell32.dll,27'; ^
$Shortcut.Save()"

echo Created: Basecut NLE.lnk (Full launcher with server)

powershell -ExecutionPolicy Bypass -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; ^
$DesktopPath = [Environment]::GetFolderPath('Desktop'); ^
$Shortcut = $WshShell.CreateShortcut($DesktopPath + '\Open Basecut NLE.lnk'); ^
$Shortcut.TargetPath = 'L:\Projects\basecut\open-basecut.bat'; ^
$Shortcut.WorkingDirectory = 'L:\Projects\basecut'; ^
$Shortcut.Description = 'Quick open Basecut NLE in browser (server must be running)'; ^
$Shortcut.IconLocation = '%SystemRoot%\System32\shell32.dll,14'; ^
$Shortcut.Save()"

echo Created: Open Basecut NLE.lnk (Quick browser open)

echo.
echo Desktop shortcuts created successfully!
echo.
echo You now have two shortcuts on your desktop:
echo   1. Basecut NLE.lnk - Starts server and opens app
echo   2. Open Basecut NLE.lnk - Quick browser open only
echo.
pause
