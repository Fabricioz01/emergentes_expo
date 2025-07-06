# 🤖 ROBOT IOT EXPLORER - SISTEMA COMPLETO
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   🤖 ROBOT IOT EXPLORER - SISTEMA COMPLETO" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚡ Iniciando backend (Node.js + MongoDB)..." -ForegroundColor Green
Set-Location Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
Set-Location ..

Write-Host "⚡ Esperando 5 segundos para que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🌐 Iniciando frontend (Angular)..." -ForegroundColor Green
Set-Location Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
Set-Location ..

Write-Host ""
Write-Host "✅ Sistema iniciado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🎮 Frontend App: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Para la demo: Abre http://localhost:4200 en tu navegador" -ForegroundColor Yellow
Write-Host "🚀 Haz clic en 'Iniciar Misión' para comenzar la simulación" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Enter para salir..." -ForegroundColor White
Read-Host
