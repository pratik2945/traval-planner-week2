@echo off
echo Starting Travel Planner - FREE Version
echo.
echo This version uses OpenStreetMap - NO API KEY REQUIRED!
echo.
echo The application will open in your browser at http://localhost:8080
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
http-server -p 8080 -o index-free.html
pause
