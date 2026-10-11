@echo off
title BudgetFlow Pro Launcher
setlocal

cd /d "%~dp0"

echo ========================================================
echo              BudgetFlow Pro Launcher
echo ========================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing required dependencies...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: Check if port 5173 is already running
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] BudgetFlow server is already active on port 5173.
) else (
    echo [INFO] Launching background development server...
    start /min "BudgetFlow Server" cmd /c "npm.cmd run dev -- --port 5173"
    timeout /t 3 /nobreak >nul
)

:: Open in dedicated frameless app window using Microsoft Edge or Chrome
echo [INFO] Opening BudgetFlow Pro in dedicated application window...

where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start "" msedge --app=http://localhost:5173/
    goto done
)

where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start "" chrome --app=http://localhost:5173/
    goto done
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173/
    goto done
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173/
    goto done
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173/
    goto done
)

:: Fallback: Open in default web browser
start "" "http://localhost:5173/"

:done
echo [SUCCESS] BudgetFlow Pro is running!
timeout /t 2 >nul
exit /b 0
