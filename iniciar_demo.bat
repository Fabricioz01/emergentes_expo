@echo off
echo ===========================================
echo    🤖 ROBOT IOT EXPLORER - SISTEMA COMPLETO
echo ===========================================
echo.

echo ⚡ Iniciando backend (Node.js + MongoDB)...
cd Backend
start "Backend IoT" cmd /k "npm start"
cd ..

echo ⚡ Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak > nul

echo 🌐 Iniciando frontend (Angular)...
cd Frontend
start "Frontend IoT" cmd /k "npm start"
cd ..

echo.
echo ✅ Sistema iniciado exitosamente!
echo.
echo 📊 Backend API: http://localhost:3000
echo 🎮 Frontend App: http://localhost:4200
echo.
echo 🎯 Para la demo: Abre http://localhost:4200 en tu navegador
echo 🚀 Haz clic en "Iniciar Misión" para comenzar la simulación
echo.
echo Presiona cualquier tecla para salir...
pause > nul
