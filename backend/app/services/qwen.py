from openai import OpenAI
from app.core.config import get_settings, get_data_dir
from app.services.prompts import get_video_analysis_prompt, get_style_analysis_prompt, get_chat_prompt
import logging
import json
import os
import cv2
import numpy as np
import base64
import tempfile
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

if not settings.QWEN_API_KEY:
        logger.warning("QWEN_API_KEY is not set. Qwen API calls will fail.")

def get_client():
    return OpenAI(
        api_key=settings.QWEN_API_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

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

def extract_frames_from_video(video_source: str | bytes, num_frames: int = 10) -> tuple[list[str], float]:
    """
    Extracts evenly spaced frames from video (bytes or file path) and returns them as base64 strings.
    """
    temp_video_path = None
    
    if isinstance(video_source, bytes):
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
            temp_video.write(video_source)
            temp_video_path = temp_video.name
    else:
        temp_video_path = video_source

    frames_base64 = []
    duration = 0.0
    try:
        cap = cv2.VideoCapture(temp_video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        if fps > 0 and total_frames > 0:
            duration = total_frames / fps
            logger.info(f"Video Stats - Total Frames: {total_frames}, FPS: {fps}, Duration: {duration:.2f}s")
        else:
            logger.warning("Could not determine video stats (FPS or Frame Count is 0)")
        
        if total_frames <= 0:
             # Try to read frames to count them if header is broken (fallback)
             # But this is slow, so maybe just return empty for now or handle gracefully
             pass

        if total_frames > 0:
            step = max(1, total_frames // num_frames)
            
            for i in range(0, total_frames, step):
                if len(frames_base64) >= num_frames:
                    break
                    
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret:
                    # Resize to reduce payload size (optional, but good for speed)
                    frame = cv2.resize(frame, (640, 360)) 
                    _, buffer = cv2.imencode('.jpg', frame)
                    b64_str = base64.b64encode(buffer).decode('utf-8')
                    frames_base64.append(b64_str)
        
        cap.release()
    except Exception as e:
        logger.error(f"Error extracting frames: {e}")
    finally:
        # Only remove if we created it (it was bytes)
        if isinstance(video_source, bytes) and temp_video_path and os.path.exists(temp_video_path):
            os.remove(temp_video_path)
            
    return frames_base64, duration

async def analyze_video(video_source: str | bytes, mime_type: str = "video/mp4", coach: str = "hu", severity: int = 5, style: str = "conservative"):
    """
    Analyzes video content using Qwen-Omni-Turbo (via frames).
    Accepts either bytes or file path string.
    """
    if not settings.QWEN_API_KEY:
        return {"error": "Qwen API Key is not configured."}

    try:
        # Extract frames and duration
        frames, duration = extract_frames_from_video(video_source)
        if not frames:
            return {"error": "Could not extract frames from video."}

        # Format duration for display
        minutes = int(duration // 60)
        seconds = int(duration % 60)
        duration_str = f"{minutes}:{seconds:02d}" if duration > 0 else "Unknown"
        
        # Inject duration into prompt
        prompt = get_video_analysis_prompt(strictness=severity, style=style)
        prompt = f"Video Duration: {duration:.2f} seconds.\n" + prompt

        logger.info(f"Starting comprehensive video analysis (Duration: {duration_str}, Severity: {severity}, Style: {style}) with Qwen-Omni...")

        # Build message content
        content_parts = []
        for b64_frame in frames:
            content_parts.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64_frame}"}
            })
        
        content_parts.append({"type": "text", "text": prompt})

        client = get_client()
        try:
            completion = client.chat.completions.create(
                model="qwen-omni-turbo",
                messages=[{"role": "user", "content": content_parts}],
                stream=False
            )
        except Exception as api_err:
            logger.error(f"OpenAI API Error: {str(api_err)}")
            return {"error": f"API Call Failed: {str(api_err)}"}
        
        text_response = completion.choices[0].message.content.strip()
        
        # Clean up markdown code blocks
        if text_response.startswith("```"):
             lines = text_response.split("\n")
             if len(lines) > 1:
                 text_response = "\n".join(lines[1:-1])
        
        try:
            result_json = json.loads(text_response)
            
            # Inject metadata into result
            if "analysis_report" not in result_json:
                result_json["analysis_report"] = {}
            result_json["analysis_report"]["video_duration"] = duration_str
            result_json["analysis_report"]["video_info"] = f"Video ({duration_str})"

            save_analysis_history(result_json, type="video")

            # --- Auto-link to Documentation DISABLED (User requested manual control) ---
            # try:
            #     video_info_text = result_json.get("analysis_report", {}).get("video_info", "")
            #     # Clean up "Video (0:31)" -> just try to find match in the whole string or parts
            #     # Actually prompt output usually puts "High Clear" in video_info if it detects it.
            #     # If prompt doesn't, we rely on top_issues tags maybe?
            #     
            #     from app.services.documentation import find_matching_doc, append_to_doc_detailed_desc
            #     
            #     # Try to find doc based on video_info or tags from issues
            #     doc = find_matching_doc(video_info_text)
            #     
            #     if not doc:
            #         # Try top issues tags
            #         for issue in result_json.get("top_issues", []):
            #             doc = find_matching_doc(issue.get("tag_name", ""))
            #             if doc: break
            #     
            #     if doc:
            #         # Extract advice to append
            #         advice_text = ""
            #         hu_advice = result_json.get("coach_advice", {}).get("coach_hu", "")
            #         if hu_advice:
            #             advice_text += f"**技术指导**: {hu_advice}\n"
            #         
            #         issues = result_json.get("top_issues", [])
            #         if issues:
            #             advice_text += "**常见问题**:\n" + "\n".join([f"- {issue['tag_name']}: {issue['description']}" for issue in issues])
            #         
            #         if advice_text:
            #             append_to_doc_detailed_desc(doc["id"], f"### 视频分析案例 ({datetime.now().strftime('%Y-%m-%d')})\n{advice_text}")
            #             logger.info(f"Auto-linked video analysis to Doc '{doc['title']}'")
            # except Exception as doc_err:
            #     logger.warning(f"Failed to auto-link to docs: {doc_err}")
            # ----------------------------------

            return {"analysis": result_json}
        except json.JSONDecodeError:
            logger.error(f"JSON Parse Error. Raw response: {text_response}")
            return {"analysis": {"error": "Parsing failed", "raw": text_response}, "error": "Parsing failed"}

    except Exception as e:
        logger.error(f"Error during video analysis: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"error": f"Analysis failed: {str(e)}"}

async def analyze_photo(photo_content: bytes, mime_type: str = "image/jpeg"):
    """
    Analyzes photo content for OOTD style review using Qwen-VL-Plus.
    """
    if not settings.QWEN_API_KEY:
        return {"error": "Qwen API Key is not configured."}
        
    try:
        prompt = get_style_analysis_prompt()
        logger.info("Starting 6-Dimension OOTD analysis with Qwen-VL-Plus...")

        b64_image = base64.b64encode(photo_content).decode('utf-8')
        
        client = get_client()
        try:
            completion = client.chat.completions.create(
                model="qwen-vl-plus", # Using qwen-vl-plus as standard for image analysis
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64_image}"}},
                            {"type": "text", "text": prompt}
                        ]
                    }
                ]
            )
        except Exception as api_err:
            logger.error(f"OpenAI API Error (Style): {str(api_err)}")
            return {"error": f"API Call Failed: {str(api_err)}"}
        
        text_response = completion.choices[0].message.content.strip()
        
        if text_response.startswith("```"):
             lines = text_response.split("\n")
             if len(lines) > 1:
                 text_response = "\n".join(lines[1:-1])
             
        try:
            result_json = json.loads(text_response)
            save_analysis_history(result_json, type="style")
            return result_json
        except json.JSONDecodeError:
            logger.error(f"JSON Parse Error (Style). Raw response: {text_response}")
            return {"error": "Parsing failed", "raw_response": text_response}

    except Exception as e:
        logger.error(f"Error during photo analysis: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"error": f"Analysis failed: {str(e)}"}

def get_embedding(text: str) -> list[float]:
    """
    Get embedding for text using Qwen text-embedding-v3.
    """
    if not settings.QWEN_API_KEY:
        return []
    
    try:
        client = get_client()
        response = client.embeddings.create(
            model="text-embedding-v3",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error getting embedding: {e}")
        return []

async def chat_with_coach(message: str, context: dict = None):
    """
    Chat with the AI Pocket Assistant using Qwen-Long.
    Includes RAG support from Knowledge Base.
    """
    if not settings.QWEN_API_KEY:
        return {"error": "Qwen API Key is not configured."}
        
    try:
        from app.services.knowledge import search_knowledge
        
        # --- Inject Coach Greeting (Skill) ---
        try:
            # Dynamically load the coach-greeting skill
            from datetime import datetime
            now = datetime.now()
            greeting = f"你好，我是斛教练，{now.month}月{now.day}号，我在合肥。"
            
            # Prepend greeting logic to system prompt or message
            # Ideally, this should be part of the system prompt to set the persona's opening state,
            # or we can prepend it to the assistant's first response if we were streaming.
            # Here we add it as a system instruction constraint.
            greeting_instruction = f"Always start your response with: '{greeting}'."
            # However, since 'chat_with_coach' is stateless per call usually, we might just prepend it to the prompt.
        except Exception as skill_err:
            logger.warning(f"Failed to load coach-greeting skill: {skill_err}")
            greeting_instruction = ""
        # -------------------------------------

        # 1. RAG Search
        rag_results = search_knowledge(message, top_k=2)
        rag_context = ""
        if rag_results:
             rag_context = "【知识库参考资料】:\n" + "\n".join([f"- {item['content']}" for item in rag_results]) + "\n"
        
        # 2. History Context
        history_context = ""
        if context:
             history_context = f"用户最近的分析记录: {json.dumps(context, ensure_ascii=False)}"
        
        prompt = get_chat_prompt(history_context + "\n" + rag_context)
        
        # Add greeting instruction to prompt
        if greeting_instruction:
            prompt += f"\n\n**Special Instruction**:\n{greeting_instruction}"

        logger.info(f"Starting chat with coach. Message: {message[:20]}...")
        if not settings.QWEN_API_KEY:
            logger.error("QWEN_API_KEY missing in settings!")

        client = get_client()
        try:
            completion = client.chat.completions.create(
                model="qwen-flash-character", 
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": message}
                ]
            )
        except Exception as api_err:
            logger.error(f"OpenAI API Error (Chat): {str(api_err)}")
            return {"error": f"API Call Failed: {str(api_err)}"}
        
        response_content = completion.choices[0].message.content
        
        # 3. Post-process: Check for Knowledge Extraction
        import re
        try:
            # Look for JSON block at the end
            # Relaxed regex to capture JSON even if it's not strictly at the end or has slight formatting issues
            json_match = re.search(r'```json\s*(\{.*?"knowledge_extraction".*?\})\s*```', response_content, re.DOTALL | re.IGNORECASE)
            
            # Fallback: try to find just the JSON object if code blocks are missing
            if not json_match:
                 json_match = re.search(r'(\{.*"knowledge_extraction".*\})', response_content, re.DOTALL | re.IGNORECASE)

            if json_match:
                json_str = json_match.group(1)
                # Clean up potential trailing commas or markdown issues before parsing
                json_str = json_str.strip()
                
                data = json.loads(json_str)
                if "knowledge_extraction" in data:
                    k_data = data["knowledge_extraction"]
                    from app.services.knowledge import add_knowledge_candidate
                    add_knowledge_candidate(
                        content=k_data.get("content", ""),
                        tags=k_data.get("tags", []),
                        source="AI_AUTO_EXTRACT"
                    )
                    logger.info("Auto-extracted knowledge candidate.")
                    
                    # --- Auto-link to Documentation ---
                    try:
                        from app.services.documentation import find_matching_doc, append_to_doc_detailed_desc
                        matched_doc = None
                        
                        # Try to match tags
                        for tag in k_data.get("tags", []):
                            matched_doc = find_matching_doc(tag)
                            if matched_doc: break
                        
                        if matched_doc:
                            append_to_doc_detailed_desc(matched_doc["id"], f"### AI 知识补充\n{k_data.get('content')}")
                            logger.info(f"Auto-linked chat knowledge to Doc '{matched_doc['title']}'")
                    except Exception as doc_err:
                        logger.warning(f"Failed to auto-link chat knowledge: {doc_err}")
                    # ----------------------------------

                    # Remove the hidden block from response to user
                    # We remove the whole match (code block or raw json)
                    response_content = response_content.replace(json_match.group(0), "").strip()
        except Exception as extract_err:
            logger.warning(f"Failed to extract knowledge: {extract_err}")

        return {"response": response_content}

    except Exception as e:
        logger.error(f"Error during chat: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"error": f"Chat failed: {str(e)}"}
