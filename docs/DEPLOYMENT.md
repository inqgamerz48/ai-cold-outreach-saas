# 🚀 Deployment Guide

> Production deployment instructions for AI Cold Outreach SaaS

---

## Quick Reference

| Component | Development | Production |
|-----------|-------------|------------|
| Frontend | `npm run dev` | `npm run build && npm start` |
| Backend | `npm run dev` | Compile TS + PM2/Docker |
| AI Engine | `python main.py` | Gunicorn + Supervisor |
| Database | SQLite | PostgreSQL recommended |

---

## Environment Setup

### Production Environment Variables

#### Server (`server/.env`)
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-here

# CORS
CORS_ORIGIN=https://yourdomain.com

# API Keys
APIFY_API_TOKEN=apify_api_xxxxx
HUNTER_API_KEY=xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password
```

#### Client (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### AI Engine (`ai-engine/.env`)
```env
OPENROUTER_API_KEY=sk-or-xxxxx
CHROMA_PERSIST_DIR=/data/chromadb
```

---

## Deployment Options

### Option 1: VPS/Cloud VM (Recommended)

**Platforms**: DigitalOcean, Linode, Vultr, AWS EC2

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.10+
sudo apt install -y python3 python3-pip python3-venv

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Clone & Setup
```bash
cd /var/www
git clone <repo-url> app
cd app

# Setup server
cd server
npm install
cp .env.example .env
# Edit .env with production values
npx prisma generate
npx prisma migrate deploy

# Setup client
cd ../client
npm install
npm run build

# Setup AI engine
cd ../ai-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

#### Step 3: Process Management with PM2
```bash
# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'api-server',
      cwd: './server',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'ai-engine',
      cwd: './ai-engine',
      script: 'venv/bin/python',
      args: 'main.py',
      interpreter: 'none'
    }
  ]
};
EOF

# Compile TypeScript
cd server && npx tsc
cd ..

# Start all services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 4: Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/app
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # AI Engine
    location /ai {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 2: Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: coldoutreach
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@postgres:5432/coldoutreach
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://server:3001
    depends_on:
      - server
    restart: unless-stopped

  ai-engine:
    build: ./ai-engine
    ports:
      - "8000:8000"
    environment:
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Server Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npx tsc
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

#### Client Dockerfile (`client/Dockerfile`)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Deploy with Docker
```bash
docker-compose up -d --build
```

---

### Option 3: Platform-as-a-Service

#### Vercel (Frontend)
```bash
cd client
vercel deploy --prod
```

#### Render.com (Backend)
1. Connect repository
2. Select `server` directory
3. Build command: `npm install && npx prisma generate && npx tsc`
4. Start command: `node dist/index.js`
5. Add environment variables

#### Railway (Full Stack)
1. Import repository
2. Add PostgreSQL database
3. Configure each service with environment variables
4. Auto-deploys on push

---

## Database Migration (SQLite to PostgreSQL)

### Step 1: Export SQLite Data
```bash
sqlite3 prisma/dev.db .dump > backup.sql
```

### Step 2: Update Schema
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Create PostgreSQL Database
```bash
createdb coldoutreach
```

### Step 4: Apply Migrations
```bash
npx prisma migrate deploy
```

### Step 5: Import Data
Use tools like `pgloader` or manually transfer essential data.

---

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 logs api-server --lines 100
```

### Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Health Checks
```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:3001/health || pm2 restart api-server
```

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong JWT secret (256+ bits)
- [ ] Configure firewall (ufw)
- [ ] Enable rate limiting
- [ ] Set up fail2ban
- [ ] Regular database backups
- [ ] Monitor for unusual activity
- [ ] Keep dependencies updated

---

## Backup Strategy

### Automated Database Backup
```bash
#!/bin/bash
# /scripts/backup.sh
DATE=$(date +%Y%m%d)
pg_dump coldoutreach > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql

# Keep last 30 days
find /backups -name "*.sql.gz" -mtime +30 -delete
```

```bash
# Crontab
0 3 * * * /scripts/backup.sh
```

---

*Last updated: December 28, 2025*
