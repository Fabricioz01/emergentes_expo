@echo off
title Sistema IoT ULEAM - Iniciador
echo.
echo ===============================================
echo   SISTEMA IoT ULEAM - MONITOREO TEMPERATURA
echo ===============================================
echo.
echo Iniciando servicios...
echo.

echo [1/2] Iniciando Backend...
start "Backend ULEAM" cmd /k "cd Backend && npm start"

echo [2/2] Esperando 5 segundos antes de iniciar Frontend...
timeout /t 5 /nobreak > nul

echo Iniciando Frontend...
start "Frontend ULEAM" cmd /k "cd Frontend && npm start"

echo.
echo ===============================================
echo   SERVICIOS INICIADOS
echo ===============================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
