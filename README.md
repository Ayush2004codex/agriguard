# AgriGuard - AI Agronomist for Precision Farming

## Overview
AgriGuard is an intelligent agricultural system that leverages multimodal AI to help farmers detect plant diseases, optimize pest management, and improve crop health through data-driven insights.

## Features
1. **Multimodal Analysis** - Process satellite/drone imagery and detect plant stress
2. **Disease Diagnosis** - Identify pests and diseases from leaf photos
3. **IPM Strategy** - Generate sustainable integrated pest management plans
4. **Conversational AI** - Talk to your AI agronomist in natural language
5. **Predictive Analytics** - Forecast disease outbreaks using weather data

## Quick Visuals: 

<img width="1914" height="928" alt="Screenshot 2026-01-14 004524" src="https://github.com/user-attachments/assets/fe60a518-9df2-4062-9d19-f74693e19dbc" />

<img width="1904" height="926" alt="Screenshot 2026-01-14 004639" src="https://github.com/user-attachments/assets/a0dc91dc-89ec-42b6-9041-0cda0ded7c46" />


Product Link: https://agriguard-sigma.vercel.app/

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

## Quick Start
See individual README files in backend/ and frontend/ folders.  

## Setup Instructions
1. Clone the repository
2. Install dependencies (see setup guide)
3. Configure .env files
4. Run backend: `python -m uvicorn app.main:app --reload`
5. Run frontend: `npm start`
6. Visit http://localhost:3000

## Installation step by step
git clone https://github.com/Ayush2004codex/agriguard.git  
cd agriguard  
pip install -r requirements.txt  
uvicorn main:app --reload  

## License
MIT
