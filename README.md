# AgriGuard - AI Agronomist for Precision Farming

## Overview
AgriGuard is an intelligent agricultural system that leverages multimodal AI to help farmers detect plant diseases, optimize pest management, and improve crop health through data-driven insights.

## Features
1. **Multimodal Analysis** - Process satellite/drone imagery and detect plant stress
2. **Disease Diagnosis** - Identify pests and diseases from leaf photos
3. **IPM Strategy** - Generate sustainable integrated pest management plans
4. **Conversational AI** - Talk to your AI agronomist in natural language
5. **Predictive Analytics** - Forecast disease outbreaks using weather data

## Tech Stack
- **Backend**: Python FastAPI
- **Frontend**: React + TypeScript
- **AI/Vision**: Ollama (LLaVA) / Claude Vision API / Gemini
- **Database**: SQLite/PostgreSQL
- **Weather API**: Open-Meteo (Free)

## Project Structure
```
agriguard/
├── backend/              # Python FastAPI server
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── models/       # AI model interfaces
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── requirements.txt
│   └── .env
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── .env
└── docs/                 # Documentation
```

## Free Backend Deployment Options

The backend is a standard FastAPI app. You can host it **for free** on any of the platforms below — no credit card required on their free tiers.

### 1. 🚂 Railway (Recommended — easiest)
Railway gives $5 of free credits/month — enough for a small API.

1. Sign up at [railway.app](https://railway.app) (GitHub login)
2. Click **New Project → Deploy from GitHub repo** → select this repo
3. Railway auto-detects the `railway.toml` at the repo root
4. Add environment variables in the Railway dashboard:
   - `GROQ_API_KEY` — get a free key at [console.groq.com](https://console.groq.com)
   - `GOOGLE_API_KEY` — optional (Gemini)
5. Click **Deploy** — Railway builds and starts the backend automatically

```bash
# Or use the Railway CLI
npm install -g @railway/cli
railway login
railway up
```

---

### 2. 🪁 Koyeb (Generous free tier — always-on)
Koyeb's free tier runs one service always-on with no sleep.

1. Sign up at [koyeb.com](https://www.koyeb.com) (GitHub login)
2. Click **Create App → GitHub** → select this repo
3. Set the **root directory** to `backend` — Koyeb uses `backend/koyeb.yaml` automatically
4. Add environment variables:
   - `GROQ_API_KEY`
   - `GOOGLE_API_KEY` (optional)
5. Click **Deploy**

Or deploy via the Koyeb CLI using the config in `backend/koyeb.yaml`:
```bash
koyeb app init agriguard-api --git github.com/<your-username>/agriguard \
  --git-branch main \
  --git-run-command "uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

---

### 3. ✈️ Fly.io (Docker-based — free hobby plan)
Fly.io runs Docker containers and has a free tier (3 shared-CPU VMs).

1. Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Sign up / log in:
   ```bash
   fly auth signup   # or: fly auth login
   ```
3. From the **repo root**, launch the app (uses `fly.toml`):
   ```bash
   fly launch --name agriguard-api --no-deploy
   ```
4. Set your secret environment variables:
   ```bash
   fly secrets set GROQ_API_KEY=<your_groq_key>
   fly secrets set GOOGLE_API_KEY=<your_google_key>   # optional
   ```
5. Deploy:
   ```bash
   fly deploy
   ```
6. Your API will be live at `https://agriguard-api.fly.dev`

---

### 4. 🎨 Render (original — free tier available)
The original deployment target. Config is in `render.yaml`.

1. Sign up at [render.com](https://render.com)
2. Click **New → Blueprint** and connect this repo
3. Render reads `render.yaml` and sets up both backend and frontend automatically
4. Add your `GROQ_API_KEY` in the Environment tab

---

### Choosing the right platform

| Platform | Free Tier | Sleep on idle? | Setup difficulty |
|----------|-----------|----------------|-----------------|
| Railway  | $5 credits/month | No | ⭐ Very easy |
| Koyeb    | 1 always-on service | No | ⭐ Very easy |
| Fly.io   | 3 shared VMs | No | ⭐⭐ Easy (needs CLI) |
| Render   | 750 hrs/month | Yes (after 15 min) | ⭐ Very easy |

> **Tip:** For the fastest setup with no cold-start issues, use **Railway** or **Koyeb**.

Visit:- https://agriguard-one.vercel.app/
