@echo off
echo ========================================
echo     POS SYSTEM - Starting Servers
echo ========================================
echo.

REM Start backend in a new window
echo [1/2] Starting Backend Server...
start "POS Backend" cmd /k "cd /d c:\Users\Acer\OneDrive\Desktop\POS_SYSTEM\backend && npm run dev"
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
echo [2/2] Starting Frontend Server...
start "POS Frontend" cmd /k "cd /d c:\Users\Acer\OneDrive\Desktop\POS_SYSTEM\frontend && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo     Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Login Credentials:
echo   Admin:   admin / admin
echo   Cashier: cashier / cashier
echo.
echo Press any key to open the application...
pause > nul

REM Open browser
start http://localhost:5173

echo.
echo Application opened in browser!
echo Check the terminal windows for server status.
echo.
pause
