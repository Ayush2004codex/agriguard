"""
AgriGuard - AI Agronomist API
Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os

from .routes import analysis_router, weather_router, ipm_router, chat_router
from .services import SmartAIProvider, OllamaProvider
from .config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🌱 AgriGuard AI Agronomist Starting...")
    
    # Check Ollama connection
    ollama = OllamaProvider()
    if await ollama.check_connection():
        models = await ollama.list_models()
        print(f"✅ Ollama connected! Available models: {models}")
    else:
        print("⚠️ Ollama not running. Using cloud APIs if configured.")
        print("   To use Ollama: Install from https://ollama.ai and run 'ollama pull llava:13b'")
    
    # Check API keys
    if os.getenv("GROQ_API_KEY"):
        print("✅ Groq API key configured")
    if os.getenv("GOOGLE_API_KEY"):
        print("✅ Gemini API key configured")
    
    print("🚀 AgriGuard is ready!")
    print(f"📍 API docs: http://localhost:{settings.PORT}/docs")
    
    yield
    
    # Shutdown
    print("👋 AgriGuard shutting down...")


# Create FastAPI app
app = FastAPI(
    title="AgriGuard - AI Agronomist",
    description="""
    🌱 **AgriGuard** - Your AI-Powered Precision Farming Assistant
    
    ## Features
    
    * **🔬 Disease Detection** - Upload plant/leaf images for instant diagnosis
    * **🗺️ Health Mapping** - Analyze satellite/drone imagery for field health
    * **🌡️ Weather Intelligence** - Get disease risk predictions based on weather
    * **📋 IPM Strategies** - Generate comprehensive pest management plans
    * **💬 AI Chat** - Conversational interface for farming advice
    
    ## Getting Started
    
    1. Use `/chat/message` for conversational queries
    2. Use `/analysis/leaf/upload` to analyze plant images
    3. Use `/weather/disease-risk` for weather-based predictions
    4. Use `/ipm/strategy` for treatment plans
    
    ## AI Providers
    
    AgriGuard supports multiple AI providers:
    - **Ollama** (default, free, local)
    - **Groq** (free tier, cloud)
    - **Gemini** (free tier, cloud)
    """,
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - allow all origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(analysis_router)
app.include_router(weather_router)
app.include_router(ipm_router)
app.include_router(chat_router)


# Root endpoint
@app.get("/")
async def root():
    """Welcome to AgriGuard"""
    return {
        "name": "AgriGuard - AI Agronomist",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "analysis": "/analysis",
            "weather": "/weather",
            "ipm": "/ipm",
            "chat": "/chat"
        },
        "message": "🌱 Welcome to AgriGuard! Visit /docs for API documentation."
    }


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check AI provider status
    ollama = OllamaProvider()
    ollama_status = await ollama.check_connection()
    
    return {
        "status": "healthy",
        "ai_providers": {
            "ollama": "connected" if ollama_status else "not_running",
            "groq": "configured" if os.getenv("GROQ_API_KEY") else "not_configured",
            "gemini": "configured" if os.getenv("GOOGLE_API_KEY") else "not_configured"
        }
    }


# AI Status endpoint
@app.get("/ai-status")
async def ai_status():
    """Check AI provider status and available models"""
    ollama = OllamaProvider()
    ollama_connected = await ollama.check_connection()
    ollama_models = await ollama.list_models() if ollama_connected else []
    
    # Priority: Groq (fast) -> Gemini -> Ollama
    if os.getenv("GROQ_API_KEY"):
        primary = "groq"
    elif os.getenv("GOOGLE_API_KEY"):
        primary = "gemini"
    elif ollama_connected:
        primary = "ollama"
    else:
        primary = "none"
    
    return {
        "primary_provider": primary,
        "ollama": {
            "status": "connected" if ollama_connected else "not_running",
            "models": ollama_models,
            "vision_model": os.getenv("OLLAMA_MODEL_VISION", "llava:13b"),
            "llm_model": os.getenv("OLLAMA_MODEL_LLM", "mistral:7b")
        },
        "groq": {
            "status": "ready" if os.getenv("GROQ_API_KEY") else "not_configured",
            "model": "llama-3.3-70b-versatile"
        },
        "gemini": {
            "status": "ready" if os.getenv("GOOGLE_API_KEY") else "not_configured",
            "model": "gemini-2.0-flash"
        }
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": str(exc),
            "hint": "Check server logs for details"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
