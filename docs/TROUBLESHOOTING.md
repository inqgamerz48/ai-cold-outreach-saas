# 🔧 Troubleshooting Guide

> Common issues and solutions for AI Cold Outreach SaaS

---

## Quick Diagnostics

### Check Service Status
```bash
# Backend health
curl http://localhost:3001/health

# AI Engine health
curl http://localhost:8000/health

# Frontend (should load)
curl -I http://localhost:3000
```

---

## Common Issues

### 1. CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions:**

1. Verify `CORS_ORIGIN` in `server/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

2. Restart the server after changes:
```bash
cd server && npm run dev
```

3. Check browser console for specific blocked headers

---

### 2. Database Connection Errors

**Symptoms:**
```
PrismaClientInitializationError: Can't reach database server
```

**Solutions:**

1. Verify `DATABASE_URL` in `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
```

2. Regenerate Prisma client:
```bash
cd server
npx prisma generate
```

3. Push schema to database:
```bash
npx prisma db push
```

4. If database is corrupted, reset:
```bash
npx prisma migrate reset
```

---

### 3. Scraper Failures

**Google Maps Scraper:**

| Error | Cause | Solution |
|-------|-------|----------|
| Timeout | Rate limiting | Add delays, use proxies |
| CAPTCHA | Bot detection | Use Apify instead |
| No results | Invalid query | Check search term format |

**LinkedIn/Reddit Scraper:**

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid Apify token | Get new token from console.apify.com |
| Actor failed | Rate limit exceeded | Wait and retry |
| Empty results | Query too specific | Broaden search terms |

**Verify API keys:**
```bash
# Test Apify
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.apify.com/v2/user/me

# Test Hunter.io
curl "https://api.hunter.io/v2/account?api_key=YOUR_KEY"
```

---

### 4. Authentication Issues

**JWT Token Errors:**
```
JsonWebTokenError: invalid signature
TokenExpiredError: jwt expired
```

**Solutions:**

1. Clear browser localStorage:
```javascript
localStorage.clear()
```

2. Verify JWT_SECRET in server:
```env
JWT_SECRET=your-secret-key
```

3. Check token expiration (default: 7 days)

---

### 5. Email Sending Failures

**Symptoms:**
```
SMTP error: Connection refused
Authentication failed
```

**Solutions:**

1. Verify SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password  # NOT your regular password
```

2. For Gmail, use App Password:
   - Go to Google Account → Security
   - Enable 2FA
   - Generate App Password

3. Test connection:
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'email', pass: 'app-password' }
});
transporter.verify(console.log);
```

---

### 6. AI Engine Not Responding

**Symptoms:**
```
ECONNREFUSED 127.0.0.1:8000
```

**Solutions:**

1. Start AI Engine:
```bash
cd ai-engine
python main.py
```

2. Check if port is in use:
```bash
netstat -ano | findstr :8000
```

3. Verify Python environment:
```bash
cd ai-engine
.\venv\Scripts\activate
pip install -r requirements.txt
```

4. Check for missing Playwright browsers:
```bash
playwright install chromium
```

---

### 7. Memory/Performance Issues

**Symptoms:**
- Slow response times
- Server crashes with OOM
- High CPU usage

**Solutions:**

1. Limit concurrent scraping jobs:
```typescript
// In searchQueue.ts
const MAX_CONCURRENT_JOBS = 2;
```

2. Increase Node memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

3. Clear Crawlee storage:
```bash
rm -rf server/storage/
```

---

### 8. Build Errors

**TypeScript Errors:**
```
error TS2304: Cannot find name 'xxx'
```

**Solutions:**

1. Install missing types:
```bash
npm install @types/package-name --save-dev
```

2. Regenerate node_modules:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Clear TypeScript cache:
```bash
rm -rf tsconfig.tsbuildinfo
```

---

### 9. Prisma Migration Issues

**Symptoms:**
```
Migration failed to apply cleanly
```

**Solutions:**

1. Reset migrations (development only):
```bash
npx prisma migrate reset
```

2. Force push schema changes:
```bash
npx prisma db push --force-reset
```

3. Resolve conflicts manually:
```bash
npx prisma migrate resolve --applied "MIGRATION_NAME"
```

---

### 10. Port Already in Use

**Symptoms:**
```
EADDRINUSE: address already in use :::3001
```

**Solutions:**

1. Find and kill process (Windows):
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

2. Find and kill process (Linux/Mac):
```bash
lsof -i :3001
kill -9 <PID>
```

3. Use different port:
```env
PORT=3002
```

---

## Debug Mode

### Enable Verbose Logging

**Server:**
```typescript
// In index.ts
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

**Prisma:**
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**Crawlee:**
```typescript
import { Log } from 'crawlee';
Log.setLevel(Log.LEVELS.DEBUG);
```

---

## Getting Help

### Collect Debug Info
When reporting issues, provide:

1. **Error message** (full stack trace)
2. **Environment** (Node/Python versions)
3. **Steps to reproduce**
4. **Relevant logs**
5. **Configuration** (sanitized)

### Log Locations
```
server/storage/       # Crawlee logs
ai-engine/*.log       # AI engine logs
client/.next/         # Next.js build logs
```

---

*Last updated: December 28, 2025*
