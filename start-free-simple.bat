@echo off
echo ========================================
echo   TRAVEL PLANNER - FREE VERSION
echo ========================================
echo.
echo This version uses OpenStreetMap
echo NO API KEY REQUIRED!
echo.
echo Starting server...
echo.
http-server -p 8080 -o index-free.html
pause
