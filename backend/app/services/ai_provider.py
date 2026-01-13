"""
AI Provider Service - Supports Ollama (local) and Groq (cloud)
Handles vision analysis and text generation for AgriGuard
"""

import base64
import json
import aiohttp
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Analyze an image and return description"""
        pass
    
    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text response"""
        pass
    
    @abstractmethod
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Multi-turn conversation"""
        pass


class OllamaProvider(AIProvider):
    """
    Ollama - Free, Local AI
    Supports: LLaVA (vision), Mistral, Llama, Deepseek
    """
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.vision_model = os.getenv("OLLAMA_MODEL_VISION", "llava:13b")
        self.llm_model = os.getenv("OLLAMA_MODEL_LLM", "mistral:7b")
    
    async def check_connection(self) -> bool:
        """Check if Ollama is running"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags") as resp:
                    return resp.status == 200
        except:
            return False
    
    async def list_models(self) -> list:
        """List available models"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return [m["name"] for m in data.get("models", [])]
        except:
            return []
        return []
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """
        Analyze image using LLaVA vision model
        """
        payload = {
            "model": self.vision_model,
            "prompt": prompt,
            "images": [image_base64],
            "stream": False
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response", "Unable to analyze image")
                    else:
                        error = await resp.text()
                        return f"Error: {error}"
        except aiohttp.ClientError as e:
            return f"Connection error: Make sure Ollama is running. Error: {str(e)}"
        except Exception as e:
            return f"Error analyzing image: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """
        Generate text using Mistral/Llama
        """
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        
        payload = {
            "model": self.llm_model,
            "prompt": full_prompt,
            "stream": False
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response", "")
                    else:
                        error = await resp.text()
                        return f"Error: {error}"
        except Exception as e:
            return f"Error generating text: {str(e)}"
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """
        Multi-turn chat conversation
        """
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)
        
        payload = {
            "model": self.llm_model,
            "messages": formatted_messages,
            "stream": False
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("message", {}).get("content", "")
                    else:
                        error = await resp.text()
                        return f"Error: {error}"
        except Exception as e:
            return f"Error in chat: {str(e)}"


class GroqProvider(AIProvider):
    """
    Groq - Free Cloud API with blazing fast inference
    Models: Llama 3.3 70B, Mixtral, Gemma
    Free tier: 30 requests/minute
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.3-70b-versatile"  # Latest model (Jan 2026)
        self.vision_model = "llama-3.2-90b-vision-preview"  # Vision model
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """
        Analyze image using Groq's vision model
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.vision_model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ],
            "max_tokens": 2048
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        error = await resp.text()
                        return f"Groq API Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text using Groq's Llama 3.1"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        return await self.chat(messages)
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Multi-turn chat with Groq"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)
        
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "max_tokens": 2048,
            "temperature": 0.7
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        error = await resp.text()
                        return f"Groq API Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"


class GeminiProvider(AIProvider):
    """
    Google Gemini - Free tier available
    Best for: Vision + reasoning combined
    Free: 15 requests/minute
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-2.0-flash"
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """Analyze image with Gemini Vision"""
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    else:
                        error = await resp.text()
                        return f"Gemini Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Generate text with Gemini"""
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    else:
                        error = await resp.text()
                        return f"Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        """Chat with Gemini"""
        # Convert to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        payload = {"contents": contents}
        
        if system_prompt:
            payload["system_instruction"] = {"parts": [{"text": system_prompt}]}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    else:
                        error = await resp.text()
                        return f"Error: {error}"
        except Exception as e:
            return f"Error: {str(e)}"


# ==================== Factory Function ====================

def get_ai_provider(provider_name: str = None) -> AIProvider:
    """
    Factory function to get the appropriate AI provider
    Priority: Groq (fast cloud) -> Gemini (paid) -> Ollama (local)
    """
    provider = provider_name or os.getenv("AI_PROVIDER", "groq")
    
    if provider == "groq":
        return GroqProvider()
    elif provider == "gemini":
        return GeminiProvider()
    elif provider == "ollama":
        return OllamaProvider()
    else:
        # Default to Groq
        return GroqProvider()


# ==================== Smart Provider (Auto-fallback) ====================

class SmartAIProvider(AIProvider):
    """
    Intelligent provider that auto-selects based on availability
    Falls back: Groq (fast) -> Gemini (paid) -> Ollama (slow local)
    """
    
    def __init__(self):
        self.ollama = OllamaProvider()
        self.groq = GroqProvider() if os.getenv("GROQ_API_KEY") else None
        self.gemini = GeminiProvider() if os.getenv("GOOGLE_API_KEY") else None
        self.current_provider = None
    
    async def _get_available_provider(self, need_vision: bool = False) -> AIProvider:
        """Get the first available provider - prioritize Groq (fast)"""
        # Try Groq first (free cloud, FAST - 500 tokens/sec)
        if self.groq and self.groq.api_key:
            self.current_provider = "groq"
            return self.groq
        
        # Try Gemini second (paid tier, best quality)
        if self.gemini and self.gemini.api_key:
            self.current_provider = "gemini"
            return self.gemini
        
        # Fallback to Ollama (local, slower without GPU)
        if await self.ollama.check_connection():
            self.current_provider = "ollama"
            return self.ollama
        
        # Last resort - return Groq even if issues (will error gracefully)
        self.current_provider = "groq"
        return self.groq if self.groq else self.ollama
    
    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        provider = await self._get_available_provider(need_vision=True)
        return await provider.analyze_image(image_base64, prompt)
    
    async def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        provider = await self._get_available_provider()
        return await provider.generate_text(prompt, system_prompt)
    
    async def chat(self, messages: list, system_prompt: str = "") -> str:
        provider = await self._get_available_provider()
        return await provider.chat(messages, system_prompt)
