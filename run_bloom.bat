@echo off
title BLOOM Menstrual Health Tracker
echo ========================================================
echo   BLOOM - Smart Period & Menstrual Health Tracker
echo ========================================================
echo.
echo Starting Bloom Flask server on port 5000...
echo.

set "PATH=%~dp0node;C:\Users\shri\.gemini\antigravity\scratch\node;%PATH%"
cd /d "%~dp0backend"

echo Opening http://localhost:5000 in your browser...
start "" "http://localhost:5000"

python app.py

pause
