@echo off
title Create BudgetFlow Pro Desktop Shortcut
setlocal enabledelayedexpansion

cd /d "%~dp0"

set "TARGET=%~dp0Launch-BudgetFlow.bat"
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\BudgetFlow Pro.lnk"

echo ========================================================
echo       Creating BudgetFlow Pro Desktop Shortcut
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\BudgetFlow Pro.lnk'); $s.TargetPath = '%~dp0Launch-BudgetFlow.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'BudgetFlow Pro Personal Finance App'; $s.Save()"

if exist "%SHORTCUT%" (
    echo [SUCCESS] Desktop shortcut created successfully!
    echo Located at: "%SHORTCUT%"
    echo You can now double-click "BudgetFlow Pro" on your Desktop anytime to open the app!
) else (
    echo [ERROR] Failed to create shortcut.
)

echo.
pause
