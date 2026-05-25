@echo off
echo ==============================================
echo Iniciando TFG Portfolio - Front-end y Back-end
echo ==============================================

echo [1/2] Iniciando Servidor Backend (Express/MongoDB)...
start "Backend" cmd /k "node back-end/server.js"

echo [2/2] Iniciando Servidor Frontend (Vite/React)...
start "Frontend" cmd /k "npm run dev"

echo ¡Todo en marcha! Se han abierto dos ventanas de comandos.
echo Por favor, no las cierres mientras uses la aplicacion.
