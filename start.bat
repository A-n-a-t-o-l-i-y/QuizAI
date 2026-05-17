@echo off
chcp 65001 >nul
echo 🚀 Запуск проекта QuizAI...
echo.

echo [1/2] Запуск Backend (Node.js)...
start "️ Backend" /D "%~dp0backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Запуск Frontend (React)...
start "🌐 Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ✅ Проект запущен!
echo  Открываю браузер...
start http://localhost:5173
echo.
echo  Закройте это окно, когда закончите работу.
pause >nul