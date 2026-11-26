@echo off
title Mirrorly - keep this window open
cd /d "%~dp0"
echo Starting Mirrorly... your browser will open in a few seconds.
echo Keep this window open while you use the site. Close it to stop the site.
start "" cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000"
npm run dev
pause
