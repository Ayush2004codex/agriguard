# AgriGuard - AI Agronomist for Precision Farming

## Overview
AgriGuard is an intelligent agricultural system that leverages multimodal AI to help farmers detect plant diseases, optimize pest management, and improve crop health through data-driven insights.

🌐 **Live Demo**: https://agriguard-one.vercel.app/

## Features
1. **Multimodal Analysis** - Process satellite/drone imagery and detect plant stress
2. **Disease Diagnosis** - Identify pests and diseases from leaf photos
3. **IPM Strategy** - Generate sustainable integrated pest management plans
4. **Conversational AI** - Talk to your AI agronomist in natural language
5. **Predictive Analytics** - Forecast disease outbreaks using weather data

## Tech Stack
- **Backend**: Python FastAPI (port 8000)
- **Frontend**: React + TypeScript + Vite (port 3000)
- **AI/Vision**: Groq (free) / Google Gemini (free) / Ollama (local, free)
- **Database**: SQLite (default, no setup required)
- **Weather API**: Open-Meteo (free, no key required)

---

## 🚀 Quick Start — Run Locally

### Prerequisites
- Python 3.10 or later
- Node.js 18 or later

### Option A — Linux / macOS

```bash
# Clone the repo
git clone https://github.com/Ayush2004codex/agriguard.git
cd agriguard

# Run setup (creates venvs, installs all dependencies, copies .env files)
chmod +x setup.sh
./setup.sh
```

### Option B — Windows

```batch
:: Run setup
setup-backend.bat
setup-frontend.bat
```

### Configure a free API key

Open `backend/.env` and add **one** of these free keys (no credit card required):

| Provider | Free Tier | Get Key |
|----------|-----------|---------|
| **Groq** (recommended) | Unlimited requests | https://console.groq.com |
| **Google Gemini** | Generous free quota | https://aistudio.google.com/app/apikey |

```env
# backend/.env
GROQ_API_KEY=your_key_here
```

### Start the servers

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.  
API docs are available at **http://localhost:8000/docs**.

---

## ☁️ Free Cloud Deployment (Backend)

The frontend is already deployable on Vercel for free. Below are **three free options** to host the backend.

### Option 1 — Render (recommended)

1. Sign up at https://render.com (free, no credit card needed)
2. In the Render dashboard → **New** → **Web Service** → connect your GitHub repo
3. Render will detect `render.yaml` automatically and create both services
4. Go to **Environment** settings of the `agriguard-api` service and add:
   ```
   GROQ_API_KEY=<your key>
   AI_PROVIDER=groq
   ```
5. Wait for the deploy to finish — your backend URL will look like  
   `https://agriguard-api.onrender.com`
6. Set `VITE_API_URL=https://agriguard-api.onrender.com` in your Vercel frontend settings

### Option 2 — Railway

1. Sign up at https://railway.app (free tier available)
2. **New Project** → **Deploy from GitHub repo** → select this repo
3. Railway reads `railway.toml` and starts the backend automatically
4. Add environment variables in the Railway dashboard:
   ```
   GROQ_API_KEY=<your key>
   AI_PROVIDER=groq
   ```
5. Copy the generated URL and set `VITE_API_URL` in Vercel

### Option 3 — Koyeb

1. Sign up at https://app.koyeb.com (free tier available)
2. **Create App** → **GitHub** → select this repo
3. Koyeb reads `backend/koyeb.yaml`; set the required env vars in the UI
4. Copy the generated URL and set `VITE_API_URL` in Vercel

---

## 🔗 Connect Deployed Frontend to Backend

If your frontend is on Vercel and backend is on Render/Railway/Koyeb:

1. In the **Vercel dashboard** → select `agriguard-frontend` → **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://<your-backend-url>
   ```
3. Redeploy the frontend

---

## Project Structure
```
agriguard/
├── backend/              # Python FastAPI server
│   ├── app/
│   │   ├── main.py       # FastAPI app entry point
│   │   ├── config.py     # Settings / env vars
│   │   ├── models/       # Pydantic data schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic & AI providers
│   │   └── utils/        # Utilities
│   ├── requirements.txt
│   ├── .env.example      # Copy to .env and fill in keys
│   └── Dockerfile
├── frontend/             # React + TypeScript web app
│   ├── src/
│   │   ├── components/
│   │   ├── services/     # Axios API client
│   │   └── App.tsx
│   ├── package.json
│   ├── .env.example      # Copy to .env and set VITE_API_URL
│   └── vite.config.ts
├── setup.sh              # One-command setup (Linux/macOS)
├── setup-backend.bat     # Setup script (Windows)
├── setup-frontend.bat    # Setup script (Windows)
├── render.yaml           # Render free-tier deployment
├── railway.toml          # Railway deployment
└── Procfile              # Heroku deployment
```
