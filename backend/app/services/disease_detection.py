"""
Plant Disease Detection Service
Uses AI vision to identify plant diseases, pests, and health issues
"""

from typing import Dict, Any, Optional
from .ai_provider import get_ai_provider, SmartAIProvider
import json
import re


# System prompts for disease detection
DISEASE_DETECTION_PROMPT = """You are an expert plant pathologist and entomologist AI assistant for farmers. 
Analyze the provided plant/leaf image and identify any diseases, pests, or health issues.

Provide your analysis in the following JSON format:
{
    "disease_detected": true/false,
    "disease_name": "Name of disease or 'Healthy' if none",
    "confidence": 0.0-1.0,
    "pest_type": "Name of pest if applicable or null",
    "lifecycle_stage": "egg/larva/pupa/adult/N/A",
    "urgency_level": "low/medium/high/critical",
    "description": "Detailed description of what you observe",
    "affected_area_percentage": 0-100,
    "symptoms": ["list", "of", "visible", "symptoms"],
    "causes": ["possible", "causes"],
    "treatment_organic": {
        "product_1": "Description and application method",
        "product_2": "Description and application method"
    },
    "treatment_chemical": {
        "product_1": {"name": "Product name", "dosage": "X ml/L", "safety": "Safety precautions"},
        "product_2": {"name": "Product name", "dosage": "X ml/L", "safety": "Safety precautions"}
    },
    "prevention_tips": ["tip1", "tip2", "tip3"],
    "spread_risk": "low/medium/high"
}

Be specific about the disease/pest identification. If you're not certain, provide your best assessment with a lower confidence score.
Focus on actionable advice that farmers can implement immediately."""


HEALTH_MAP_PROMPT = """You are an expert agricultural analyst specializing in satellite and drone imagery analysis.
Analyze this field/farm image and create a health assessment.

Provide your analysis in the following JSON format:
{
    "overall_health_score": 0-100,
    "analysis_type": "satellite/drone/ground",
    "zones": [
        {
            "zone_id": "A1",
            "location": "description of location in image",
            "health_score": 0-100,
            "color_indicator": "green/yellow/brown/etc",
            "concerns": ["list of concerns"],
            "likely_cause": "what's causing the issue",
            "priority": "low/medium/high"
        }
    ],
    "stress_indicators": {
        "water_stress": true/false,
        "nutrient_deficiency": true/false,
        "pest_damage": true/false,
        "disease_presence": true/false
    },
    "watering_priority_zones": ["A1", "B2"],
    "fertilization_zones": ["zone ids needing fertilizer"],
    "immediate_actions": ["action 1", "action 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "estimated_affected_area": "X% of field"
}

Use visible color patterns to identify stress:
- Dark green = healthy
- Light green/yellow = possible nutrient deficiency or water stress
- Brown/dead patches = disease, pest damage, or severe stress
- Irregular patterns = pest infestation
- Uniform stress = environmental/irrigation issues"""


class DiseaseDetectionService:
    """Service for detecting plant diseases from images"""
    
    def __init__(self, provider: str = None):
        self.ai = SmartAIProvider()
    
    async def analyze_leaf(self, image_base64: str, context: str = "") -> Dict[str, Any]:
        """
        Analyze a leaf/plant image for diseases
        
        Args:
            image_base64: Base64 encoded image
            context: Additional context (crop type, location, etc.)
        
        Returns:
            Disease detection results
        """
        prompt = DISEASE_DETECTION_PROMPT
        if context:
            prompt += f"\n\nAdditional context from farmer: {context}"
        
        # Get AI analysis
        response = await self.ai.analyze_image(image_base64, prompt)
        
        # Parse the response
        result = self._parse_disease_response(response)
        result["raw_analysis"] = response
        
        return result
    
    async def analyze_field(self, image_base64: str, field_info: str = "") -> Dict[str, Any]:
        """
        Analyze satellite/drone imagery of a field
        
        Args:
            image_base64: Base64 encoded field image
            field_info: Information about the field
        
        Returns:
            Health map analysis
        """
        prompt = HEALTH_MAP_PROMPT
        if field_info:
            prompt += f"\n\nField information: {field_info}"
        
        response = await self.ai.analyze_image(image_base64, prompt)
        result = self._parse_health_map_response(response)
        result["raw_analysis"] = response
        
        return result
    
    async def quick_diagnosis(self, image_base64: str, question: str) -> str:
        """
        Quick conversational diagnosis
        
        Args:
            image_base64: Base64 encoded image
            question: Farmer's question about the image
        
        Returns:
            Natural language response
        """
        prompt = f"""You are a friendly and knowledgeable agricultural advisor. 
A farmer has sent you an image and asked: "{question}"

Analyze the image and respond in a helpful, conversational manner.
Be specific about what you see and provide practical advice.
If you identify any issues, explain:
1. What the problem is
2. How serious it is
3. What they should do about it (both organic and chemical options)
4. How to prevent it in the future

Keep your response clear and farmer-friendly - avoid overly technical jargon."""
        
        return await self.ai.analyze_image(image_base64, prompt)
    
    def _parse_disease_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response into structured data"""
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
        
        # Fallback: return raw response with default structure
        return {
            "disease_detected": True,
            "disease_name": "Analysis Complete",
            "confidence": 0.7,
            "description": response,
            "urgency_level": "medium",
            "treatment_organic": {},
            "treatment_chemical": {},
            "parse_error": True
        }
    
    def _parse_health_map_response(self, response: str) -> Dict[str, Any]:
        """Parse health map response"""
        try:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
        
        return {
            "overall_health_score": 70,
            "zones": [],
            "recommendations": [response],
            "parse_error": True
        }


# Common crop diseases database for enhanced detection
COMMON_DISEASES = {
    "tomato": [
        "Late Blight", "Early Blight", "Septoria Leaf Spot", 
        "Bacterial Spot", "Tomato Yellow Leaf Curl", "Fusarium Wilt"
    ],
    "potato": [
        "Late Blight", "Early Blight", "Black Scurf", 
        "Common Scab", "Potato Virus Y"
    ],
    "rice": [
        "Rice Blast", "Bacterial Leaf Blight", "Brown Spot",
        "Sheath Blight", "Tungro Disease"
    ],
    "wheat": [
        "Wheat Rust", "Powdery Mildew", "Septoria", 
        "Fusarium Head Blight", "Take-all"
    ],
    "corn": [
        "Gray Leaf Spot", "Northern Corn Leaf Blight", 
        "Common Rust", "Southern Corn Leaf Blight"
    ],
    "cotton": [
        "Cotton Leaf Curl", "Bacterial Blight", "Alternaria Leaf Spot",
        "Fusarium Wilt", "Verticillium Wilt"
    ]
}

COMMON_PESTS = {
    "universal": [
        {"name": "Aphids", "damage": "Sap sucking, virus transmission"},
        {"name": "Whiteflies", "damage": "Sap sucking, sooty mold"},
        {"name": "Spider Mites", "damage": "Leaf stippling, webbing"},
        {"name": "Thrips", "damage": "Leaf scarring, virus transmission"},
        {"name": "Caterpillars", "damage": "Leaf eating, fruit damage"}
    ],
    "corn": [
        {"name": "Fall Armyworm", "damage": "Severe leaf and ear damage"},
        {"name": "Corn Borer", "damage": "Stalk tunneling"},
        {"name": "Corn Earworm", "damage": "Ear tip damage"}
    ],
    "cotton": [
        {"name": "Bollworm", "damage": "Boll destruction"},
        {"name": "Pink Bollworm", "damage": "Seed and lint damage"}
    ]
}
