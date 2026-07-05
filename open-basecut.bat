@echo off
REM Quick launcher - opens Basecut NLE in browser
REM Use this if the dev server is already running

start "" http://localhost:3000

echo Opening Basecut NLE in browser...
echo If the app doesn't load, make sure to run start-basecut.bat first
timeout /t 2 >nul
