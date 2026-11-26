@echo off
title Mirrorly - keep this window open
cd /d "%~dp0"
echo Starting Mirrorly... your browser will open in about 15 seconds.
echo Keep this window open while you use the site. Close it to stop the site.
if exist ".next" rmdir /s /q ".next"
start "" cmd /c "timeout /t 15 /nobreak >nul & start http://localhost:3000"
npm run dev
pause
