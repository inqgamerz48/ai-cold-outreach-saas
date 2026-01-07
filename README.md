# NEXUS | INTELLIGENCE SYSTEM

> [!IMPORTANT]
> **V3.0 "VOID INDUSTRIAL" UPDATE IS LIVE**
> The interface has been completely overhauled to meet the `NEXUS.CMD` specification.
> - **Theme**: Void Industrial (Absolute Black / Acid Green)
> - **Typography**: Cinzel (Headers) + Manrope (Technical)
> - **Engine**: Next.js 16 + Tailwind v4

A powerful, high-frequency lead generation and intelligence system built for power users.
Designed to extract, analyze, and engage with precision.

![Status](https://img.shields.io/badge/Status-OPERATIONAL-00ff00)
![Version](https://img.shields.io/badge/Version-3.0.0-CCFF00)
![Theme](https://img.shields.io/badge/Theme-VOID_INDUSTRIAL-000000)

---

## ⚡ CORE MODULES

### 🗺️ MAPS_EXTRACTOR
- **Target**: Local Business Entities
- **Output**: Contact Data, Physical Location, Operational Status
- **Capacity**: High-Volume Ingestion

### 💼 LINKEDIN_MINER
- **Target**: Professional Decision Makers
- **Output**: Verified Emails, Role Hierarchy, Employment History
- **Power**: Apify Actor Integration

### 📡 REDDIT_OSINT
- **Target**: Community Sentiment & Discussions
- **Output**: Needs Analysis, Pain Point Identification
- **Method**: Keyword & Subreddit Scanning

### 📧 CAMPAIGN_ENGINE
- **Template System**: Dynamic Variable Injection
- **AI Composition**: GPT-4 Powered Personalization
- **Delivery**: Rate-Limited SMTP Rotation
- **Analytics**: Intent Recognition & Sentiment Sorting

---

## 🏗️ SYSTEM ARCHITECTURE

```
NEXUS-CORE/
├── client/                 # NEXT.JS 16 FRONTEND (Port 3000)
│   ├── app/
│   │   ├── page.tsx       # NEXUS.CMD (Dashboard)
│   │   ├── layout.tsx     # VOID THEME PROVIDER
│   │   ├── globals.css    # INDUSTRIAL CSS VARS
│   │   └── components/    # MECHANICAL UI COMPONENTS
│   └── ...
├── server/                 # NODE.JS BACKENDS (Port 3001)
│   ├── src/
│   │   ├── scrapers/      # CRAWLEE WORKERS
│   │   └── services/      # BUSINESS LOGIC
│   └── ...
└── ai-engine/             # PYTHON INTELLIGENCE (Port 8000)
    └── ...
```

---

## 🛠️ TECH STACK

| Component | Technology | Identity |
|-----------|------------|----------|
| **Frontend** | Next.js 16, React 19, Framer Motion | **Void Industrial** |
| **Styling** | Tailwind CSS v4 | **Nexus Design System** |
| **Backend** | Node.js, Express 5, Crawlee | **Nexus API** |
| **Intelligence**| Python, FastAPI, LangChain | **Nexus Brain** |
| **Database** | PostgreSQL / SQLite | **Data Vault** |

---

## 🚀 INITIALIZATION

### 1. DEPENDENCY INJECTION

```bash
# SERVER NODE
cd server && npm install

# CLIENT NODE
cd ../client && npm install

# AI ENGINE (PYTHON)
cd ../ai-engine
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. ENV CONFIGURATION

Ensure `.env` contains valid credentials for:
- `DATABASE_URL`
- `APIFY_API_TOKEN`
- `HUNTER_API_KEY`

### 3. SYSTEM STARTUP

```bash
# TERMINAL 1: BACKEND UPLINK
cd server && npm run dev

# TERMINAL 2: FRONTEND INTERFACE
cd client && npm run dev

# TERMINAL 3: AI ENGINE
cd ai-engine && python main.py
```

### 4. ACCESS POINTS

- **CMD**: http://localhost:3000
- **API**: http://localhost:3001
- **AI**: http://localhost:8000

---

## 📝 LICENSE

**PROPRIETARY & CONFIDENTIAL.**
Authorized Personnel Only.

---

*SYSTEM STATUS: ONLINE*
