# AI Cold Outreach SaaS

A powerful, AI-powered lead generation and cold outreach system built with Next.js, Node.js, and Python.

![Status](https://img.shields.io/badge/Phase-2%20Complete-green)
![License](https://img.shields.io/badge/License-Private-red)

---

## 🚀 Features

### Lead Discovery
- **Google Maps Scraper** - Extract local business leads with contact info
- **LinkedIn Search** - Find decision-makers via Apify actors
- **Reddit Discovery** - Identify potential leads from relevant discussions
- **Email Enrichment** - Automatically find email addresses using Hunter.io

### Queue System
- Async job processing with status tracking
- Concurrent request handling
- Real-time job monitoring

### Modern UI
- Dark theme dashboard with animations
- Universal scraper interface
- Job history and lead management
- Settings page for API configuration

---

## 📁 Project Structure

```
email cold revaher/
├── client/                 # Next.js frontend (Port 3000)
│   ├── app/
│   │   ├── page.tsx       # Dashboard
│   │   ├── scraper/       # Scraper pages
│   │   ├── jobs/          # Job management
│   │   ├── leads/         # Leads database
│   │   ├── personas/      # Personas database
│   │   └── settings/      # API key configuration
│   └── ...
├── server/                 # Node.js backend (Port 3001)
│   ├── src/
│   │   ├── index.ts       # Express server
│   │   ├── scrapers/      # Crawlee scrapers
│   │   └── services/      # Business logic
│   └── prisma/            # Database schema
└── ai-engine/             # Python AI services (Port 8000)
    ├── main.py            # FastAPI server
    └── scrapers/          # Social media scrapers
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript, Crawlee |
| AI Engine | Python, FastAPI, Playwright |
| Database | SQLite with Prisma ORM |
| Scraping | Apify, Playwright, Crawlee |
| Email | Hunter.io API |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install Python dependencies
cd ../ai-engine
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example env file:
```bash
cd server
cp .env.example .env
```

Edit `.env` with your API keys:
```env
DATABASE_URL="file:./dev.db"

# Optional - for real data scraping
APIFY_API_TOKEN=your_apify_token
HUNTER_API_KEY=your_hunter_key
```

### 3. Initialize Database

```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Start All Services

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# Terminal 3 - AI Engine (optional)
cd ai-engine
python main.py
```

---

## 🔑 API Keys Configuration

### Via Settings Page (Recommended)

1. Open the app at `http://localhost:3000`
2. Navigate to **Settings**
3. Enter your API keys
4. Click **Save Settings**

### Via Environment Variables

Add to `server/.env`:

```env
# Apify - For LinkedIn & Reddit scraping
# Get at: https://console.apify.com/account/integrations
APIFY_API_TOKEN=apify_api_xxxxx

# Hunter.io - For email finding
# Get at: https://hunter.io/api-keys
HUNTER_API_KEY=xxxxx
```

---

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### Settings
```
GET  /api/settings     # Get current config status
POST /api/settings     # Save API keys
```

### Search Jobs
```
POST /api/search/maps      # Google Maps search
POST /api/search/linkedin  # LinkedIn search
POST /api/search/reddit    # Reddit search
POST /api/search/twitter   # Twitter search
GET  /api/search/job/:id   # Get job status & results
```

### Authentication
```
POST /api/auth/register    # Create account
POST /api/auth/login       # Login
```

---

## 📊 Database Schema

| Model | Purpose |
|-------|---------|
| Tenant | Multi-tenancy support |
| User | User accounts |
| SearchJob | Scraping job tracking |
| Lead | Business leads (Google Maps) |
| Persona | People leads (LinkedIn, Reddit) |
| Campaign | Email campaigns |
| EmailLog | Sent email tracking |

---

## 🔄 Development Phases

### ✅ Phase 1: Foundation
- [x] Project setup
- [x] Database schema
- [x] Authentication
- [x] Basic UI

### ✅ Phase 2: Lead Discovery
- [x] Google Maps scraper (Crawlee)
- [x] LinkedIn via Apify
- [x] Reddit via Apify
- [x] Email enrichment (Hunter.io)
- [x] Queue system
- [x] Settings page

### 🚧 Phase 3: Email Personalization (Next)
- [ ] AI email generation (GPT)
- [ ] RAG knowledge base
- [ ] Email templates
- [ ] Reply classification

### 📋 Phase 4: Campaign Management
- [ ] Campaign creation
- [ ] Scheduling system
- [ ] Analytics dashboard
- [ ] Rate limiting

---

## 🧪 Testing

### Run TypeScript Checks
```bash
# Server
cd server && npx tsc --noEmit

# Client
cd client && npx tsc --noEmit
```

### Run ESLint
```bash
cd client && npx eslint .
```

### Test API
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/health"

# Google Maps search
$body = @{term='Coffee Shops NYC'} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/search/maps" -Method POST -Body $body -ContentType "application/json"
```

---

## 📝 License

Private - All rights reserved.

---

## 🤝 Contributing

This is a private project. Contact the owner for contribution guidelines.
