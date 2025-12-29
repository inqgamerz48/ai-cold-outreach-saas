# 🏠 Local Development Deployment Guide

> Get the AI Cold Outreach SaaS running on your local machine in under 10 minutes!

---

## 📋 Prerequisites

Before you begin, make sure you have these installed:

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| **Node.js** | 18.x or higher | `node --version` |
| **npm** | 9.x or higher | `npm --version` |
| **Python** | 3.10 or higher | `python --version` |
| **Docker** | Latest | `docker --version` |
| **Git** | Latest | `git --version` |

---

## 🚀 Quick Start (One-Command Launch)

After completing the setup steps below, you can start all services with:

```powershell
# Windows PowerShell
.\start_all.ps1
```

This launches:
- 🧠 **AI Engine** (Python FastAPI) - Port `8000`
- ⚙️ **Backend Server** (Node.js/Express) - Port `3001`
- 🎨 **Frontend** (Next.js) - Port `3000`

---

## 📝 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd email-cold-revaher
```

### Step 2: Start PostgreSQL Database

The easiest way is using Docker:

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps
```

This starts PostgreSQL on `localhost:5432` with:
- **User**: `user`
- **Password**: `password`
- **Database**: `cold_outreach`

> [!TIP]
> If you prefer a local PostgreSQL installation, update the connection string in your `.env` file.

---

### Step 3: Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# Or on Unix: cp .env.example .env
```

#### Configure `server/.env`:

```env
# Database (matches docker-compose.yml)
DATABASE_URL="postgresql://user:password@localhost:5432/cold_outreach?schema=public"

# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:3000

# Optional API Keys (add as needed)
APIFY_API_TOKEN=your_apify_token
HUNTER_API_KEY=your_hunter_key
OPENROUTER_API_KEY=sk-or-your-key

# SMTP (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

#### Initialize Database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed initial data
npx prisma db seed
```

#### Start Backend:

```bash
npx ts-node src/index.ts
```

The server runs at `http://localhost:3001`

---

### Step 4: Setup Frontend Client

Open a **new terminal**:

```bash
cd client

# Install dependencies
npm install

# Create environment file
```

#### Configure `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Start Frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`

---

### Step 5: Setup AI Engine (Python)

Open a **new terminal**:

```bash
cd ai-engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (for scraping)
playwright install chromium
```

#### Configure `ai-engine/.env`:

```env
# OpenRouter API (for LLM calls)
OPENROUTER_API_KEY=sk-or-your-key

# Reddit API (optional)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=LeadGen/1.0

# Twitter API (optional)
TWITTER_BEARER_TOKEN=your_bearer_token

# Server Port
AI_ENGINE_PORT=8000
```

#### Start AI Engine:

```bash
python main.py
```

The AI Engine runs at `http://localhost:8000`

---

## 🔧 Service Ports Overview

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `http://localhost:3000` | User interface (Next.js) |
| Backend API | `http://localhost:3001` | REST API (Node.js/Express) |
| AI Engine | `http://localhost:8000` | AI/ML services (FastAPI) |
| PostgreSQL | `localhost:5432` | Database |

---

## 🏃 Running All Services

### Option A: Using the PowerShell Script (Recommended for Windows)

```powershell
# From project root
.\start_all.ps1
```

### Option B: Manual Start (3 Terminals)

**Terminal 1 - Database:**
```bash
docker-compose up -d
```

**Terminal 2 - Backend:**
```bash
cd server
npx ts-node src/index.ts
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 4 - AI Engine:**
```bash
cd ai-engine
venv\Scripts\activate  # Windows
python main.py
```

---

## 🔍 Verifying Your Setup

### 1. Check Database Connection
```bash
cd server
npx prisma studio
```
Opens Prisma Studio at `http://localhost:5555`

### 2. Check API Health
```bash
curl http://localhost:3001/health
# Should return: { "status": "ok" }
```

### 3. Check AI Engine
```bash
curl http://localhost:8000/health
# Should return: { "status": "ok" }
```

### 4. Access Frontend
Open `http://localhost:3000` in your browser

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Port already in use"
```bash
# Windows - Find process using port
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <pid> /F
```

#### 2. "Cannot find module '@prisma/client'"
```bash
cd server
npx prisma generate
```

#### 3. "Connection refused to PostgreSQL"
- Ensure Docker is running: `docker ps`
- Restart PostgreSQL: `docker-compose restart postgres`
- Check logs: `docker-compose logs postgres`

#### 4. "CORS errors in browser"
Ensure your `server/.env` has:
```env
CORS_ORIGIN=http://localhost:3000
```

#### 5. "Python virtual environment not found"
```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

#### 6. "PowerShell script execution disabled"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📁 Project Structure

```
email-cold-revaher/
├── client/                 # Next.js Frontend
│   ├── src/app/           # App Router pages
│   ├── src/components/    # React components
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── src/               # TypeScript source
│   ├── prisma/            # Database schema
│   └── package.json
│
├── ai-engine/             # Python AI Services
│   ├── main.py            # FastAPI server
│   ├── scrapers/          # Lead scraping modules
│   ├── services/          # AI services
│   └── requirements.txt
│
├── docker-compose.yml     # PostgreSQL container
├── start_all.ps1          # Launch all services
└── docs/                  # Documentation
```

---

## 🔑 Getting API Keys

| Service | Get Key Here | Used For |
|---------|--------------|----------|
| OpenRouter | [openrouter.ai](https://openrouter.ai) | AI email generation |
| Apify | [apify.com](https://apify.com) | LinkedIn scraping |
| Hunter.io | [hunter.io](https://hunter.io) | Email enrichment |
| Reddit | [reddit.com/prefs/apps](https://reddit.com/prefs/apps) | Reddit lead discovery |
| Twitter/X | [developer.twitter.com](https://developer.twitter.com) | Twitter lead discovery |

---

## 🎉 You're All Set!

Visit `http://localhost:3000` and start discovering leads!

**Next Steps:**
1. Create an account on the dashboard
2. Configure your SMTP settings for email
3. Start a lead discovery search job
4. Generate AI-powered emails

---

*Last updated: December 29, 2025*
