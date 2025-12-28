# ⚡ Quick Start Guide

> Get up and running in 10 minutes

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| Python | 3.10+ | `python --version` |
| npm | 8+ | `npm --version` |

---

## 1️⃣ Install Dependencies (3 min)

```powershell
# Server
cd server
npm install

# Client
cd ../client
npm install

# AI Engine
cd ../ai-engine
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

## 2️⃣ Configure Environment (1 min)

```powershell
cd server
copy .env.example .env
```

Edit `server/.env` (minimal config):
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

---

## 3️⃣ Initialize Database (1 min)

```powershell
cd server
npx prisma generate
npx prisma db push
```

---

## 4️⃣ Start All Services (5 min)

**Option A: PowerShell Script**
```powershell
.\start_all.ps1
```

**Option B: Manual (3 terminals)**

| Terminal | Command | Port |
|----------|---------|------|
| 1 | `cd server && npm run dev` | 3001 |
| 2 | `cd client && npm run dev` | 3000 |
| 3 | `cd ai-engine && python main.py` | 8000 |

---

## 5️⃣ Access Application

- **Dashboard**: http://localhost:3000
- **API Health**: http://localhost:3001/health
- **AI Engine**: http://localhost:8000/docs

---

## 6️⃣ First Steps

### New User? Start with Onboarding
1. Go to http://localhost:3000/onboarding
2. Follow the 5-step setup wizard
3. Configure API keys and create your first lead search

### Create Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter email, password, name
4. Login

### Configure API Keys (Optional)
1. Navigate to Settings (⚙️ icon)
2. Add **Apify Token** for LinkedIn/Reddit
3. Add **Hunter.io Key** for email enrichment
4. Save

### Run First Search
1. Go to Scraper page
2. Select "Google Maps"
3. Enter search term: `Coffee shops in Brooklyn`
4. Click "Start Search"
5. Wait for results in Jobs queue

### Create Email Campaign
1. Go to Templates → Create a template
2. Go to Email Accounts → Add your SMTP
3. Go to Campaigns → New Campaign
4. Follow the 4-step wizard

---

## Quick Commands Reference

```powershell
# Start development
cd server && npm run dev
cd client && npm run dev
cd ai-engine && python main.py

# Database operations
npx prisma studio          # Visual database browser
npx prisma migrate dev     # Create migration
npx prisma db push         # Push schema changes

# Type checking
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# API testing
curl http://localhost:3001/health
```

---

## What's Next?

1. 📖 Read [HANDOVER.md](./HANDOVER.md) for full documentation
2. 🚀 Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. 🔧 Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if issues arise

---

*Happy coding! 🎉*
