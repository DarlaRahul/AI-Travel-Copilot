Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting AI Travel Copilot Services" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$env:PATH = "$env:LOCALAPPDATA\nodejs;" + $env:PATH

Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$env:LOCALAPPDATA\nodejs;' + `$env:PATH; cd frontend; npm run dev"

Start-Sleep -Seconds 3
Write-Host "`nAll services active!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White

Start-Process "http://localhost:5173"
