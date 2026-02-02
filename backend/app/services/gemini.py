from google import genai
from google.genai import types
from app.core.config import get_settings
from app.services.prompts import get_video_analysis_prompt, get_style_analysis_prompt, get_chat_prompt
import logging
import json
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

if not settings.GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY is not set. Gemini API calls will fail.")

def get_client():
    return genai.Client(api_key=settings.GOOGLE_API_KEY)

def save_analysis_history(data: dict, type: str = "video"):
    """Saves the analysis result to a local JSON file."""
    # Use a unified history file
    history_file = os.path.join(get_data_dir(), "history.json")
    os.makedirs(os.path.dirname(history_file), exist_ok=True)
    
    history = []
    if os.path.exists(history_file):
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []
    
    # Add metadata
    entry = {
        "id": str(len(history) + 1),
        "created_at": datetime.now().isoformat(),
        "type": type,
        "data": data
    }
    
    # Prepend to list (newest first)
    history.insert(0, entry)
    
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

async def analyze_video(video_content: bytes, mime_type: str = "video/mp4", coach: str = "hu", severity: int = 5, style: str = "conservative"):
    """
    Analyzes video content using Google Gemini API.
    """
    if not settings.GOOGLE_API_KEY:
        return {"error": "Google API Key is not configured."}

    try:
        # Use the new prompt generator with strictness and style
        prompt = get_video_analysis_prompt(strictness=severity, style=style)
        logger.info(f"Starting comprehensive video analysis (Severity: {severity}, Style: {style})...")

        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, types.Part.from_bytes(data=video_content, mime_type=mime_type)]
        )
        
        text_response = response.text.strip()
        # Clean up markdown code blocks if present
        if text_response.startswith("```"):
             lines = text_response.split("\n")
             if len(lines) > 1:
                 # Remove first line (```json) and last line (```)
                 text_response = "\n".join(lines[1:-1])
        
        try:
            result_json = json.loads(text_response)
            save_analysis_history(result_json, type="video")
            return {"analysis": result_json}
        except json.JSONDecodeError:
            logger.error(f"JSON Parse Error. Raw response: {text_response}")
            return {"analysis": {"error": "Parsing failed", "raw": text_response}, "error": "Parsing failed"}

    except Exception as e:
        logger.error(f"Error during video analysis: {str(e)}")
        return {"error": f"Analysis failed: {str(e)}"}

async def analyze_photo(photo_content: bytes, mime_type: str = "image/jpeg"):
    """
    Analyzes photo content for OOTD style review using the new 6-dimension metric.
    """
    if not settings.GOOGLE_API_KEY:
        return {"error": "Google API Key is not configured."}
        
    try:
        prompt = get_style_analysis_prompt()
        logger.info("Starting 6-Dimension OOTD analysis...")

        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, types.Part.from_bytes(data=photo_content, mime_type=mime_type)]
        )
        
        text_response = response.text.strip()
        if text_response.startswith("```"):
             lines = text_response.split("\n")
             if len(lines) > 1:
                 text_response = "\n".join(lines[1:-1])
             
        try:
            result_json = json.loads(text_response)
            save_analysis_history(result_json, type="style")
            # Return the full result directly as per new spec
            return result_json
        except json.JSONDecodeError:
            logger.error(f"JSON Parse Error (Style). Raw response: {text_response}")
            return {"error": "Parsing failed", "raw_response": text_response}

    except Exception as e:
        logger.error(f"Error during photo analysis: {str(e)}")
        return {"error": f"Analysis failed: {str(e)}"}

async def chat_with_coach(message: str, context: dict = None):
    """
    Chat with the AI Pocket Assistant.
    """
    if not settings.GOOGLE_API_KEY:
        return {"error": "Google API Key is not configured."}
        
    try:
        # Build context string from recent history if available
        history_context = ""
        if context:
             history_context = f"用户最近的分析记录: {json.dumps(context, ensure_ascii=False)}"
        
        prompt = get_chat_prompt(history_context)
        
        logger.info(f"Starting chat with coach. Message: {message[:20]}...")

        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, message]
        )
        
        return {"response": response.text}

    except Exception as e:
        logger.error(f"Error during chat: {str(e)}")
        return {"error": f"Chat failed: {str(e)}"}
