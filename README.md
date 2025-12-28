# 🚀 AI Cold Outreach SaaS

A powerful, AI-powered lead generation and cold outreach system built with Next.js, Node.js, and Python.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-Private-red)

---

## ✨ Features

### 🔍 Lead Discovery
- **Google Maps Scraper** - Extract local business leads with contact info
- **LinkedIn Search** - Find decision-makers via Apify actors
- **Reddit Discovery** - Identify potential leads from relevant discussions
- **Twitter Search** - Track conversations and find prospects
- **Email Enrichment** - Automatically find email addresses using Hunter.io

### 📧 Email Campaigns
- **Email Templates** - Create reusable templates with {{variables}}
- **AI Email Generation** - GPT-powered personalized email composition
- **Campaign Wizard** - 4-step campaign creation with audience selection
- **Email Scheduling** - Rate-limited sending with daily quotas
- **SMTP Integration** - Connect Gmail, Outlook, or custom SMTP

### 📊 Analytics & Tracking
- **Reply Classification** - AI-powered sentiment and intent analysis
- **Campaign Performance** - Open rates, reply rates, conversions
- **Visual Dashboards** - Charts for sentiment, intent breakdown
- **Real-time Monitoring** - Job status and queue tracking

### 🎨 Modern UI
- **Dark Theme Dashboard** - Sleek, animated interface
- **Onboarding Wizard** - Step-by-step setup guide
- **Landing Page** - Professional marketing page
- **Responsive Design** - Works on all devices

---

## 📁 Project Structure

```
ai-cold-outreach-saas/
├── client/                 # Next.js 16 frontend (Port 3000)
│   ├── app/
│   │   ├── page.tsx       # Dashboard
│   │   ├── scraper/       # Multi-source scraper UI
│   │   ├── leads/         # Leads database
│   │   ├── personas/      # Personas database
│   │   ├── campaigns/     # Campaign management
│   │   ├── templates/     # Email templates
│   │   ├── analytics/     # Visual analytics
│   │   ├── email-accounts/# SMTP configuration
│   │   ├── onboarding/    # Setup wizard
│   │   ├── landing/       # Marketing page
│   │   └── settings/      # API configuration
│   └── components/        # Reusable components
├── server/                 # Node.js backend (Port 3001)
│   ├── src/
│   │   ├── index.ts       # Express server (1000+ lines)
│   │   ├── scrapers/      # Crawlee scrapers
│   │   └── services/      # Business logic
│   │       ├── campaignService.ts
│   │       ├── campaignScheduler.ts
│   │       ├── emailSender.ts
│   │       ├── aiService.ts
│   │       └── apifyService.ts
│   └── prisma/            # Database schema
├── ai-engine/             # Python AI services (Port 8000)
│   ├── main.py            # FastAPI server
│   ├── scrapers/          # Social media scrapers
│   └── services/          # RAG & AI services
└── docs/                  # Documentation
    ├── HANDOVER.md        # Complete technical docs
    ├── DEPLOYMENT.md      # Production deployment
    ├── TROUBLESHOOTING.md # Common issues
    └── QUICKSTART.md      # 10-min setup
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Express 5, TypeScript, Crawlee, Prisma |
| AI Engine | Python, FastAPI, LangChain, ChromaDB |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Scraping | Apify, Playwright, Crawlee |
| Email | Nodemailer, Hunter.io API |
| Charts | Recharts |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

### 1. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install

# AI Engine
cd ../ai-engine
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cd server && cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Optional API Keys
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
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev

# Terminal 3 - AI Engine (optional)
cd ai-engine && python main.py
```

### 5. Access Application

- **App**: http://localhost:3000
- **API**: http://localhost:3001
- **AI Engine**: http://localhost:8000

---

## 🌐 Available Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats |
| `/scraper` | Multi-source lead scraper |
| `/leads` | Leads database |
| `/personas` | People/contacts database |
| `/campaigns` | Campaign management |
| `/campaigns/new` | Campaign creation wizard |
| `/templates` | Email templates |
| `/email-accounts` | SMTP configuration |
| `/analytics` | Visual analytics |
| `/settings` | API key configuration |
| `/landing` | Marketing landing page |
| `/onboarding` | Setup wizard |

---

## 🔑 API Keys

### Required for Full Functionality

| Service | Purpose | Get From |
|---------|---------|----------|
| **Apify** | LinkedIn & Reddit scraping | [console.apify.com](https://console.apify.com) |
| **Hunter.io** | Email enrichment | [hunter.io/api-keys](https://hunter.io/api-keys) |

### Optional

| Service | Purpose |
|---------|---------|
| **OpenRouter** | AI email generation |
| **Twitter API** | Tweet scraping |

---

## 📊 Database Schema

12 models covering:
- **Authentication**: Tenant, User
- **Lead Discovery**: SearchJob, Lead, Persona
- **Campaigns**: Campaign, EmailLog, Reply
- **Templates**: Template, KnowledgeItem
- **Infrastructure**: EmailAccount, Log

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/HANDOVER.md](docs/HANDOVER.md) | Complete technical documentation |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | 10-minute setup guide |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues & fixes |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |
| [docs/TECHNICAL_SPECS.md](docs/TECHNICAL_SPECS.md) | System requirements |

---

## 🧪 Testing

```bash
# TypeScript checks
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# Linting
cd client && npx eslint .

# API health check
curl http://localhost:3001/health
```

---

## 📈 Development Status

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation | ✅ Complete | 100% |
| Phase 2: Lead Discovery | ✅ Complete | 100% |
| Phase 3: Email AI | ✅ Complete | 100% |
| Phase 4: Campaign Management | ✅ Complete | 100% |
| Phase 5: Polish & Launch | ✅ Complete | 100% |

---

## 📝 License

Private - All rights reserved.

---

## 🤝 Support

For technical documentation, see the [docs/](docs/) folder.

---

*Built with ❤️ using Next.js, Node.js, and Python*
