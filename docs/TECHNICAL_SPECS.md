# 📐 Technical Specifications

> System requirements, limits, and technical constraints

---

## System Requirements

### Development Environment

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 5 GB | 20+ GB |
| **OS** | Windows 10, macOS 12, Ubuntu 20.04 | Latest |

### Runtime Requirements

| Service | Runtime | Version |
|---------|---------|---------|
| Server | Node.js | 18+ (LTS recommended) |
| Client | Node.js | 18+ |
| AI Engine | Python | 3.10+ |
| Database | SQLite | 3.x (dev) |
| Database | PostgreSQL | 14+ (prod) |

---

## Rate Limits & Quotas

### Internal Limits

| Resource | Limit | Configurable |
|----------|-------|--------------|
| Concurrent scrape jobs | 3 | Yes (`MAX_CONCURRENT_JOBS`) |
| API requests/minute | 100 | Yes (express-rate-limit) |
| Email sends/day/account | 50 | Yes (EmailAccount.dailyLimit) |
| Max leads per search | 100 | Yes |

### External API Limits

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Apify** | $5/month credits | ~500 actor runs |
| **Hunter.io** | 25 requests/month | Email finder only |
| **OpenRouter** | Pay-per-use | Varies by model |
| **SMTP (Gmail)** | 500/day | App password required |

---

## Performance Benchmarks

### Response Times (Development)

| Endpoint | Average | P95 |
|----------|---------|-----|
| `GET /health` | <10ms | 20ms |
| `GET /api/leads` | 50-100ms | 200ms |
| `POST /api/search/maps` | 100-200ms | 500ms |
| Scrape job (Google Maps) | 30-60s | 120s |

### Memory Usage

| Service | Idle | Active |
|---------|------|--------|
| Server (Node.js) | ~100 MB | 200-400 MB |
| Client (Next.js) | ~150 MB | 250-400 MB |
| AI Engine (Python) | ~200 MB | 500-1000 MB |
| Playwright browser | ~300 MB | 400-600 MB |

---

## Database Specifications

### SQLite (Development)

| Constraint | Limit |
|------------|-------|
| Max database size | 281 TB |
| Max row size | 1 GB |
| Concurrent writes | 1 (locked) |
| Concurrent reads | Unlimited |

### PostgreSQL (Production)

| Constraint | Limit |
|------------|-------|
| Max database size | 1 PB |
| Max connections | 100+ (configurable) |
| Concurrent writes | High |
| ACID compliance | Full |

### Recommended Indexes

```sql
-- Already defined in schema.prisma
CREATE INDEX Lead_tenantId_idx ON Lead(tenantId);
CREATE INDEX Lead_email_idx ON Lead(email);
CREATE INDEX Persona_tenantId_idx ON Persona(tenantId);
CREATE INDEX Campaign_status_idx ON Campaign(status);
CREATE INDEX EmailLog_campaignId_idx ON EmailLog(campaignId);
```

---

## Security Specifications

### Authentication

| Parameter | Value |
|-----------|-------|
| JWT algorithm | HS256 |
| Token expiration | 7 days (default) |
| Password hashing | bcrypt (cost factor 12) |
| Minimum password length | 6 characters |

### API Security

| Feature | Implementation |
|---------|----------------|
| Rate limiting | 100 req/min per IP |
| CORS | Single origin (configurable) |
| Input validation | Basic (recommend Zod) |
| SQL injection | Protected (Prisma ORM) |
| XSS protection | React auto-escaping |

### Encryption

| Data | Method |
|------|--------|
| Passwords | bcrypt hash |
| JWT tokens | HS256 signature |
| API keys (at rest) | Base64 (recommend AES-256) |
| Database (SQLite) | None (recommend encryption-at-rest for prod) |

---

## Network Specifications

### Ports

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 3000 | HTTP |
| Backend API | 3001 | HTTP |
| AI Engine | 8000 | HTTP |
| PostgreSQL | 5432 | TCP |

### CORS Configuration

```typescript
{
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
```

### Required Outbound Access

| Destination | Port | Purpose |
|-------------|------|---------|
| api.apify.com | 443 | Apify actors |
| api.hunter.io | 443 | Email enrichment |
| openrouter.ai | 443 | LLM API |
| smtp.gmail.com | 587 | Email sending |
| imap.gmail.com | 993 | Reply monitoring |

---

## File Storage

### Crawlee Storage

```
server/storage/
├── datasets/           # Scraped data
├── key_value_stores/   # Cache
└── request_queues/     # Pending URLs
```

### ChromaDB (AI Engine)

```
ai-engine/chroma_db/
└── collections/        # Vector embeddings
```

---

## Browser Automation

### Playwright Configuration

| Setting | Value |
|---------|-------|
| Browser | Chromium |
| Headless | Yes (production) |
| Viewport | 1280x720 |
| User agent | Custom (anti-detection) |
| Timeout | 30 seconds |

### Crawlee Configuration

| Setting | Value |
|---------|-------|
| Max concurrency | 5 |
| Max requests/min | 30 |
| Retry count | 3 |
| Memory limit | 1 GB |

---

## Error Codes

### HTTP Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

### Custom Error Codes

| Code | Description |
|------|-------------|
| E001 | Invalid API key |
| E002 | Scraper timeout |
| E003 | Rate limit exceeded |
| E004 | Email enrichment failed |
| E005 | AI generation failed |

---

*Last updated: December 28, 2025*
