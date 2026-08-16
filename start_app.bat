@echo off
title AI Travel Copilot - Launching Services
echo ===================================================
echo Starting AI Travel Copilot Services
echo ===================================================

set PATH=%LOCALAPPDATA%\nodejs;%PATH%

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "AI Travel Copilot - Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
cd frontend
start "AI Travel Copilot - Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo Services started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ===================================================
timeout /t 3 >nul
start http://localhost:5173
