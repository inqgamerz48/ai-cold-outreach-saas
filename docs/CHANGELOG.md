# 📜 Changelog & Version History

> All notable changes to AI Cold Outreach SaaS

---

## [Unreleased]

### In Progress
- AI email generation UI integration
- IMAP reply monitoring
- RAG knowledge base completion

---

## [0.3.0] - 2025-12-28

### Added
- **Reply Tracking Module**
  - IMAP inbox monitoring service
  - AI-powered reply classification (sentiment/intent)
  - EmailLog updates with reply status

- **Analytics Dashboard**
  - Visual charts using Recharts
  - Open/reply rate metrics
  - Lead source breakdown

- **Security Enhancements**
  - JWT authentication guards
  - Refined CORS configuration
  - Express rate limiting
  - Input validation improvements

### Changed
- Dashboard now shows real-time campaign stats
- Settings page improved with validation

### Fixed
- CORS issues between frontend and backend
- Preload warnings for font files

---

## [0.2.0] - 2025-12-27

### Added
- **Lead Discovery System**
  - Google Maps scraper (Crawlee)
  - LinkedIn search via Apify
  - Reddit discovery via Apify
  - Twitter search integration

- **Email Enrichment**
  - Hunter.io API integration
  - Pattern-based email generation fallback

- **Queue System**
  - Async job processing
  - Status tracking (PENDING, RUNNING, COMPLETED, FAILED)
  - Concurrent request handling

- **Settings Page**
  - API key configuration UI
  - Encrypted storage

### Changed
- Migrated scrapers from direct Playwright to Crawlee
- Improved error handling in search workers

---

## [0.1.0] - 2025-12-26

### Added
- **Project Foundation**
  - Node.js/Express backend
  - Next.js 16 frontend
  - Python/FastAPI AI engine

- **Database Schema**
  - Multi-tenant architecture (Tenant, User)
  - Lead discovery models (SearchJob, Lead, Persona)
  - Campaign management models
  - Email infrastructure models

- **Authentication System**
  - JWT-based auth
  - User registration/login
  - Password hashing with bcrypt

- **Basic UI**
  - Dashboard with animated stats
  - Dark theme with Framer Motion
  - Responsive navigation

---

## Version Comparison

| Version | Phase | Features | Status |
|---------|-------|----------|--------|
| 0.1.0 | Foundation | Auth, DB, Basic UI | ✅ Complete |
| 0.2.0 | Lead Discovery | Scrapers, Queue, Enrichment | ✅ Complete |
| 0.3.0 | Email AI | Reply tracking, Analytics | 🚧 60% |
| 0.4.0 | Campaigns | Scheduling, SMTP | 📋 Planned |
| 1.0.0 | Launch | Polish, Docs, Landing | 📋 Planned |

---

## Migration Notes

### 0.2.0 → 0.3.0
1. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
2. Update environment variables (new IMAP settings)
3. Restart all services

### 0.1.0 → 0.2.0
1. Install new dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
2. Run migrations for new models
3. Configure Apify and Hunter.io tokens

---

*Keep this updated with each significant change.*
