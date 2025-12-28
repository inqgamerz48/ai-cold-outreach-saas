$host.ui.RawUI.WindowTitle = "LeadGen Engine Launcher"

Write-Host "Starting AI Engine (Python)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k cd ai-engine && venv\Scripts\activate && python main.py" -NoNewWindow

Write-Host "Starting Commander Server (Node.js)..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/k cd server && npx ts-node src/index.ts" -NoNewWindow

Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Magenta
Start-Process -FilePath "cmd" -ArgumentList "/k cd client && npm run dev" -NoNewWindow

Write-Host "All systems Go!" -ForegroundColor Yellow
