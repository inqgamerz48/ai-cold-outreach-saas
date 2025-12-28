# 📦 Project Handover Documentation

> **AI Cold Outreach SaaS** - Complete Technical Handover Package  
> Last Updated: December 28, 2025

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Setup & Installation](#setup--installation)
8. [Configuration Guide](#configuration-guide)
9. [Development Workflow](#development-workflow)
10. [Feature Status](#feature-status)
11. [Third-Party Integrations](#third-party-integrations)
12. [Security Considerations](#security-considerations)
13. [Known Issues & Limitations](#known-issues--limitations)
14. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**AI Cold Outreach SaaS** is a full-stack lead generation and automated outreach system designed for B2B sales teams. The platform enables users to discover business leads from multiple sources, enrich contact information, and manage email campaigns with AI-powered personalization.

### Core Value Proposition
- **Multi-source lead discovery** (Google Maps, LinkedIn, Reddit, Twitter)
- **Automated email enrichment** via Hunter.io integration
- **Queue-based async processing** for scalable scraping
- **Modern, animated UI** with real-time job monitoring
- **Multi-tenant architecture** for SaaS deployment

### Current Status
| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation | ✅ Complete | 100% |
| Phase 2: Lead Discovery | ✅ Complete | 100% |
| Phase 3: Email AI | ✅ Complete | 100% |
| Phase 4: Campaign Management | ✅ Complete | 100% |
| Phase 5: Polish & Launch | ✅ Complete | 100% |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                          │
│                         Port: 3000                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │Dashboard │ │ Scraper  │ │  Leads   │ │Campaigns │ │ Settings │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP/REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js/Express)                        │
│                         Port: 3001                                  │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│   │   Scrapers   │ │   Services   │ │  Middleware  │                │
│   │  (Crawlee)   │ │  (Queue/AI)  │ │ (Auth/CORS)  │                │
│   └──────────────┘ └──────────────┘ └──────────────┘                │
│                          │                                          │
│                    ┌─────┴─────┐                                    │
│                    │  Prisma   │                                    │
│                    │   ORM     │                                    │
│                    └─────┬─────┘                                    │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   SQLite    │
                    │  Database   │
                    └─────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    AI ENGINE (Python/FastAPI)                       │
│                         Port: 8000                                  │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│   │   Scrapers   │ │    RAG       │ │   Email AI   │                │
│   │ (Playwright) │ │  Service     │ │  Generator   │                │
│   └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

### Service Communication
| From | To | Protocol | Purpose |
|------|----|----------|---------|
| Client | Server | REST/HTTP | All frontend API calls |
| Server | AI Engine | REST/HTTP | AI email generation, reply classification |
| Server | Apify | REST/HTTP | LinkedIn/Reddit scraping via cloud actors |
| Server | Hunter.io | REST/HTTP | Email enrichment |

---

## Technology Stack

### Frontend (Client)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Lucide React | 0.562 | Icons |
| Recharts | 3.6.0 | Analytics charts |

### Backend (Server)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.2.1 | HTTP server |
| TypeScript | 5.9.3 | Type safety |
| Prisma | 5.22.0 | ORM & database toolkit |
| Crawlee | 3.15.3 | Web scraping framework |
| Playwright | 1.57.0 | Browser automation |
| Apify Client | 2.21.0 | Cloud scraping actors |
| Nodemailer | 7.0.12 | Email sending |
| JWT | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |

### AI Engine
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | Latest | HTTP server |
| Playwright | Latest | Browser automation |
| ChromaDB | Latest | Vector database for RAG |
| LangChain | Latest | LLM orchestration |
| OpenAI | Latest | GPT integration |

### Database
| Technology | Purpose |
|------------|---------|
| SQLite | Development database |
| Prisma Migrate | Schema migrations |

---

## Project Structure

```
email cold revaher/
│
├── 📁 client/                      # Next.js Frontend
│   ├── 📁 app/                     # App Router pages
│   │   ├── 📄 page.tsx             # Dashboard (main)
│   │   ├── 📄 layout.tsx           # Root layout
│   │   ├── 📄 globals.css          # Global styles
│   │   ├── 📁 analytics/           # Analytics page
│   │   ├── 📁 campaigns/           # Campaign management
│   │   ├── 📁 components/          # Shared components
│   │   ├── 📁 jobs/                # Job monitoring
│   │   ├── 📁 leads/               # Leads database
│   │   ├── 📁 personas/            # Personas database
│   │   ├── 📁 scraper/             # Scraper UI
│   │   └── 📁 settings/            # Configuration
│   ├── 📁 public/                  # Static assets
│   ├── 📁 types/                   # TypeScript types
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📁 server/                      # Node.js Backend
│   ├── 📁 src/
│   │   ├── 📄 index.ts             # Main server (32KB)
│   │   ├── 📁 scrapers/            # Crawlee scrapers
│   │   │   ├── 📄 googleMapsScraper.ts
│   │   │   ├── 📄 linkedinScraper.ts
│   │   │   ├── 📄 redditScraper.ts
│   │   │   └── 📄 twitterScraper.ts
│   │   ├── 📁 services/            # Business logic
│   │   │   ├── 📄 apifyService.ts
│   │   │   ├── 📄 emailEnrichmentService.ts
│   │   │   ├── 📄 searchQueue.ts
│   │   │   └── 📄 aiService.ts
│   │   └── 📁 middleware/          # Express middleware
│   │       └── 📄 authMiddleware.ts
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma        # Database schema
│   │   ├── 📄 dev.db               # SQLite database
│   │   └── 📁 migrations/          # Migration history
│   ├── 📄 package.json
│   └── 📄 .env.example
│
├── 📁 ai-engine/                   # Python AI Services
│   ├── 📄 main.py                  # FastAPI server
│   ├── 📁 scrapers/
│   │   ├── 📄 linkedin_scraper.py
│   │   ├── 📄 reddit_scraper.py
│   │   └── 📄 twitter_scraper.py
│   ├── 📁 services/
│   │   └── 📄 rag_service.py       # RAG knowledge base
│   ├── 📄 requirements.txt
│   └── 📄 .env.example
│
├── 📄 README.md                    # Project readme
├── 📄 start_all.ps1                # Windows startup script
└── 📄 project_valuation.md         # Project assessment
```

---

## Database Schema

The application uses SQLite with Prisma ORM. Schema consists of **12 models** organized into logical domains:

### Authentication & Multi-Tenancy
```prisma
model Tenant {
  id             Int              @id @default(autoincrement())
  name           String
  users          User[]
  searchJobs     SearchJob[]
  campaigns      Campaign[]
  templates      Template[]
  knowledgeItems KnowledgeItem[]
  emailAccounts  EmailAccount[]
}

model User {
  id           Int    @id @default(autoincrement())
  email        String @unique
  passwordHash String
  name         String?
  tenantId     Int
  role         String @default("USER") // USER, ADMIN
}
```

### Lead Discovery
```prisma
model SearchJob {
  id       Int    @id @default(autoincrement())
  term     String
  status   String @default("PENDING") // PENDING, RUNNING, COMPLETED, FAILED
  source   String @default("GOOGLE_MAPS") // GOOGLE_MAPS, LINKEDIN, REDDIT, TWITTER
  leads    Lead[]
  personas Persona[]
}

model Lead {
  id           Int     @id @default(autoincrement())
  name         String
  company      String?
  address      String?
  phone        String?
  website      String?
  email        String?
  // ... social profiles, ratings
}

model Persona {
  id          Int    @id @default(autoincrement())
  name        String
  role        String?
  company     String?
  linkedinUrl String?
  email       String?
  source      String @default("GOOGLE_SERP")
}
```

### Campaign Management
```prisma
model Campaign {
  id           Int        @id @default(autoincrement())
  name         String
  status       String     @default("DRAFT") // DRAFT, ACTIVE, PAUSED, COMPLETED
  emailsSent   Int        @default(0)
  repliesCount Int        @default(0)
  emailLogs    EmailLog[]
}

model EmailLog {
  id         Int      @id @default(autoincrement())
  subject    String
  body       String
  sentAt     DateTime @default(now())
  opened     Boolean  @default(false)
  replied    Boolean  @default(false)
  replies    Reply[]
}

model Reply {
  id        Int    @id @default(autoincrement())
  content   String
  sentiment String @default("NEUTRAL") // POSITIVE, NEGATIVE, NEUTRAL
  intent    String @default("UNKNOWN") // INTERESTED, NOT_INTERESTED, QUESTION
}
```

### Email Infrastructure
```prisma
model EmailAccount {
  id         Int     @id @default(autoincrement())
  email      String
  smtpHost   String
  smtpPort   Int
  smtpUser   String
  smtpPass   String
  imapHost   String?
  imapPort   Int?
  dailyLimit Int     @default(50)
  sentToday  Int     @default(0)
}

model Template {
  id      Int    @id @default(autoincrement())
  name    String
  subject String
  body    String // Supports {{variables}}
}
```

### Knowledge Base (RAG)
```prisma
model KnowledgeItem {
  id       Int     @id @default(autoincrement())
  type     String  // CASE_STUDY, OFFER, TONE_EXAMPLE
  title    String
  content  String
  vectorId String? // ChromaDB vector ID
}
```

---

## API Reference

### Base URL
```
Development: http://localhost:3001
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "...", "name": "..." }
}
```

### Search Jobs

#### Google Maps Search
```http
POST /api/search/maps
Authorization: Bearer <token>
Content-Type: application/json

{
  "term": "Coffee shops in New York"
}

Response:
{
  "jobId": 123,
  "status": "PENDING"
}
```

#### LinkedIn Search
```http
POST /api/search/linkedin
Authorization: Bearer <token>
Content-Type: application/json

{
  "term": "Marketing Director SaaS"
}
```

#### Reddit Search
```http
POST /api/search/reddit
Authorization: Bearer <token>
Content-Type: application/json

{
  "term": "startup founders looking for tools"
}
```

#### Get Job Status
```http
GET /api/search/job/:id
Authorization: Bearer <token>

Response:
{
  "id": 123,
  "term": "Coffee shops NYC",
  "status": "COMPLETED",
  "source": "GOOGLE_MAPS",
  "leads": [...],
  "personas": [...]
}
```

### Leads & Personas

#### Get All Leads
```http
GET /api/leads
Authorization: Bearer <token>

Query params:
  - page: number (default: 1)
  - limit: number (default: 50)
```

#### Get All Personas
```http
GET /api/personas
Authorization: Bearer <token>
```

### Settings

#### Get Settings Status
```http
GET /api/settings
Authorization: Bearer <token>

Response:
{
  "hasApifyToken": true,
  "hasHunterKey": false
}
```

#### Save Settings
```http
POST /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "apifyToken": "apify_api_xxx",
  "hunterKey": "hunter_xxx"
}
```

### AI Engine Endpoints (Port 8000)

#### Generate Email
```http
POST /api/generate-email
Content-Type: application/json

{
  "lead": { "name": "John", "company": "Acme Inc" },
  "context": "We offer marketing automation",
  "tone": "professional"
}
```

#### Classify Reply
```http
POST /api/classify-reply
Content-Type: application/json

{
  "replyText": "Thanks for reaching out, I'd like to learn more."
}

Response:
{
  "sentiment": "POSITIVE",
  "intent": "INTERESTED"
}
```

---

## Setup & Installation

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.10+
- **npm** or **yarn**
- **Git** (for version control)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd "email cold revaher"
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 4: Install AI Engine Dependencies
```bash
cd ../ai-engine
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
playwright install chromium
```

### Step 5: Configure Environment Variables

#### Server (.env)
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# API Keys (optional for basic functionality)
APIFY_API_TOKEN=your_apify_token
HUNTER_API_KEY=your_hunter_key
```

### Step 6: Initialize Database
```bash
cd server
npx prisma generate
npx prisma db push
```

### Step 7: Start All Services

**Option A: Using PowerShell Script**
```powershell
.\start_all.ps1
```

**Option B: Manual Start (3 terminals)**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# Terminal 3 - AI Engine
cd ai-engine && python main.py
```

### Step 8: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Engine**: http://localhost:8000

---

## Configuration Guide

### Required API Keys

| Service | Purpose | Where to Get | Cost |
|---------|---------|--------------|------|
| **Apify** | LinkedIn & Reddit scraping | [console.apify.com](https://console.apify.com) | Free tier available |
| **Hunter.io** | Email enrichment | [hunter.io/api-keys](https://hunter.io/api-keys) | 25 free/month |

### Optional API Keys

| Service | Purpose | Notes |
|---------|---------|-------|
| **OpenRouter** | LLM access | For AI email generation |
| **Twitter API** | Tweet scraping | Requires developer account |

### Configuring via Settings Page
1. Navigate to http://localhost:3000/settings
2. Enter API keys in the form
3. Click "Save Settings"
4. Keys are stored encrypted in the database

### Configuring via Environment Variables
Add to `server/.env`:
```env
APIFY_API_TOKEN=apify_api_xxxxx
HUNTER_API_KEY=xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
```

---

## Development Workflow

### Running in Development Mode

```bash
# Start all services with hot reload
npm run dev  # in each directory
```

### Database Migrations

```bash
cd server

# Create migration after schema changes
npx prisma migrate dev --name describe_change

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: destroys data)
npx prisma migrate reset
```

### Type Checking

```bash
# Server
cd server && npx tsc --noEmit

# Client
cd client && npx tsc --noEmit
```

### Linting

```bash
cd client && npx eslint .
```

### Building for Production

```bash
# Client
cd client && npm run build

# Server (compile TypeScript)
cd server && npx tsc
```

---

## Feature Status

### ✅ Completed Features

| Feature | Description | Location |
|---------|-------------|----------|
| User Authentication | JWT-based login/register | `server/src/index.ts` |
| Multi-tenancy | Tenant isolation for data | `prisma/schema.prisma` |
| Google Maps Scraper | Extract local business leads | `server/src/scrapers/` |
| LinkedIn Search | Via Apify actors | `server/src/services/apifyService.ts` |
| Reddit Search | Via Apify actors | `server/src/services/apifyService.ts` |
| Email Enrichment | Hunter.io integration | `server/src/services/emailEnrichmentService.ts` |
| Queue System | Async job processing | `server/src/services/searchQueue.ts` |
| Dashboard UI | Animated stats & charts | `client/app/page.tsx` |
| Settings Page | API key management | `client/app/settings/` |
| Job Monitoring | Real-time status updates | `client/app/jobs/` |
| Leads Database | View & export leads | `client/app/leads/` |
| Email Templates | CRUD with variables | `client/app/templates/` |
| AI Email Generation | GPT-powered composer | `client/app/components/EmailComposer.tsx` |
| Campaign Wizard | 4-step creation flow | `client/app/campaigns/new/` |
| Email Accounts | SMTP configuration | `client/app/email-accounts/` |
| Campaign Scheduler | Rate-limited queue | `server/src/services/campaignScheduler.ts` |
| Analytics Dashboard | Charts with Recharts | `client/app/analytics/` |
| Reply Classification | AI sentiment/intent | `server/src/services/aiService.ts` |
| Landing Page | Marketing page | `client/app/landing/` |
| Onboarding Wizard | Setup guide | `client/app/onboarding/` |

### 🚧 In Progress Features

*All major features are now complete!*

### 📋 Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| A/B Email Testing | Medium | Subject line variants |
| IMAP Reply Monitoring | Medium | Auto-fetch incoming replies |
| Mobile Responsive | Low | Currently desktop-optimized |
| Automated Tests | Medium | Jest & Playwright tests |

---

## Third-Party Integrations

### Apify (Cloud Scraping)
- **Actors Used**: 
  - `apify/google-search-scraper` - LinkedIn SERP search
  - `curious_coder/reddit-scraper` - Reddit posts
- **Rate Limits**: Based on subscription tier
- **Error Handling**: Implemented with retry logic

### Hunter.io (Email Enrichment)
- **Endpoint**: `https://api.hunter.io/v2/email-finder`
- **Rate Limit**: 25 requests/month (free tier)
- **Fallback**: Pattern-based email generation

### OpenRouter (LLM Access)
- **Models**: GPT-4, Claude, etc. via unified API
- **Usage**: Email generation, reply classification
- **Configuration**: Set `OPENROUTER_API_KEY` in environment

---

## Security Considerations

### Authentication
- JWT tokens with configurable expiration
- Password hashing with bcrypt (cost factor: 12)
- Rate limiting on auth endpoints

### Data Protection
- Tenant isolation at database level
- API keys stored with encryption
- CORS configured for specific origin

### Recommendations for Production
1. **Use HTTPS** - Configure SSL/TLS
2. **Rotate JWT Secret** - Use strong, unique secret
3. **Database Encryption** - Migrate to encrypted database in production
4. **API Rate Limiting** - Already implemented, tune thresholds
5. **Input Validation** - Add Zod schemas for all endpoints
6. **Audit Logging** - Extend `Log` model for security events

---

## Known Issues & Limitations

### Current Limitations

| Issue | Impact | Workaround |
|-------|--------|------------|
| SQLite limitations | Not suitable for high concurrency | Migrate to PostgreSQL for production |
| Google Maps CAPTCHA | Random blocks during scraping | Use Apify for Google Maps |
| LinkedIn direct scraping | Blocked without proxy | Use Apify actors only |
| No email verification | Invalid emails can be stored | Validate before campaigns |

### Technical Debt

1. **Test Coverage** - No automated tests yet
2. **Error Boundaries** - Need React error boundaries
3. **Loading States** - Incomplete skeleton loaders
4. **TypeScript Strictness** - Some `any` types remain

---

## Future Roadmap

### Phase 3: Email Personalization (Next Priority)
- [ ] GPT-4/Claude email generator integration
- [ ] RAG knowledge base with ChromaDB
- [ ] Email template system with variables
- [ ] A/B testing for subject lines

### Phase 4: Campaign Management
- [ ] Campaign creation wizard
- [ ] Gmail/SMTP OAuth integration
- [ ] Drip sequence scheduling
- [ ] Reply monitoring (IMAP)

### Phase 5: Polish & Launch
- [ ] Comprehensive error handling
- [ ] Mobile responsive UI
- [ ] Onboarding flow
- [ ] Landing page
- [ ] Documentation site

---

## Support & Contact

### Getting Help
1. Review this documentation
2. Check `README.md` in project root
3. Examine code comments in key files
4. Review database schema in `prisma/schema.prisma`

### Key Files to Review
- `server/src/index.ts` - Main API server (32KB)
- `client/app/page.tsx` - Dashboard implementation
- `prisma/schema.prisma` - Complete data model
- `ai-engine/main.py` - AI service endpoints

---

*Documentation generated: December 28, 2025*
