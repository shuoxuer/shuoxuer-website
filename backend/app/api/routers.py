from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from app.services.qwen import analyze_video, analyze_photo, chat_with_coach
from app.services.knowledge import add_knowledge_candidate, get_knowledge_entries, approve_knowledge_entry, reject_knowledge_entry, search_knowledge
from app.core.config import get_data_dir
from typing import Optional, Dict, List
import os
import json
from collections import Counter

api_router = APIRouter()

# --- Analysis Endpoints ---

@api_router.post("/analyze/video")
async def analyze_video_endpoint(
    video: UploadFile = File(...),
    coach: str = Form("hu"),
    severity: Optional[int] = Form(5),
    style: Optional[str] = Form("conservative")
):
    try:
        content = await video.read()
        result = await analyze_video(content, video.content_type, coach, severity, style)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analysis/style")
async def analyze_photo_endpoint(
    photo: UploadFile = File(...)
):
    try:
        content = await photo.read()
        result = await analyze_photo(content, photo.content_type)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat")
async def chat_endpoint(
    message: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    context: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None)
):
    """
    Unified Chat Endpoint for Text, Video, and Image.
    """
    from app.services.history import create_session, add_message, save_archive_entry

    try:
        # Ensure Session Exists (only if not provided or empty string)
        if not session_id or session_id == "null" or session_id == "undefined":
            session = create_session()
            session_id = session["id"]

        # 1. Handle File Uploads (Intent Recognition by File Type)
        if file:
            filename = file.filename.lower()
            
            # Save file to static/uploads (Streamed to avoid RAM issues)
            import uuid
            import aiofiles
            
            file_ext = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", unique_filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            async with aiofiles.open(file_path, 'wb') as out_file:
                while content_chunk := await file.read(1024 * 1024):  # 1MB chunks
                    await out_file.write(content_chunk)
                
            file_url = f"http://localhost:8000/static/uploads/{unique_filename}"
            
            # Save User Message (File)
            add_message(session_id, "user", f"Uploaded file: {filename}", "file", {"url": file_url})

            # Video Analysis Intent
            if filename.endswith(('.mp4', '.mov', '.avi', '.webm')):
                # Pass file_path to avoid reloading large file into RAM
                result = await analyze_video(file_path, file.content_type, coach="hu", severity=5, style="conservative")
                
                if "analysis" in result:
                     # 1. Save to Archive (The permanent report store)
                     archive_id = save_archive_entry(
                        type="video",
                        result=result["analysis"].get("analysis_report", {}).get("video_info", "Video Analysis"),
                        data={
                            "analysis": result["analysis"],
                            "file_url": file_url
                        }
                     )
                     
                     # 2. Save to Chat Session (The conversation history)
                     card_data = {
                         "type": "video",
                         "data": result["analysis"],
                         "fileUrl": file_url,
                         "archiveId": archive_id # Link to the archive
                     }
                     add_message(session_id, "assistant", "视频分析已完成，点击下方报告查看详情。", "report_card", card_data)

                     return {
                         "role": "assistant",
                         "content": "视频分析已完成，点击下方报告查看详情。",
                         "type": "report_card",
                         "cardData": card_data,
                         "sessionId": session_id
                     }
                return result

            # Style/OOTD Analysis Intent
            elif filename.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                # Read file content for image analysis (Images are small enough)
                async with aiofiles.open(file_path, 'rb') as f:
                    content = await f.read()
                    
                result = await analyze_photo(content, file.content_type)
                
                # Check for errors from analysis
                if "error" in result:
                    return result # Return error directly

                # 1. Save to Archive (The permanent report store)
                archive_id = save_archive_entry(
                    type="style",
                    result=result.get("one_line_summary", "Style Analysis"),
                    data={
                        **result,
                        "file_url": file_url
                    }
                )

                # 2. Save to Chat Session (The conversation history)
                card_data = {
                    "type": "style",
                    "data": result,
                    "fileUrl": file_url,
                    "archiveId": archive_id # Link to the archive
                }
                add_message(session_id, "assistant", result.get("message", "穿搭分析已完成。"), "report_card", card_data)

                return {
                     "role": "assistant",
                     "content": result.get("message", "穿搭分析已完成。"),
                     "type": "report_card",
                     "cardData": card_data,
                     "sessionId": session_id
                 }

        # 2. Handle Text Chat
        if message:
            # Save User Message
            add_message(session_id, "user", message)

            ctx = json.loads(context) if context else None
            result = await chat_with_coach(message, ctx)
            if "error" in result:
                 raise HTTPException(status_code=500, detail=result["error"])
            
            # Save Assistant Message
            add_message(session_id, "assistant", result["response"])

            return {
                "role": "assistant",
                "content": result["response"],
                "type": "text",
                "sessionId": session_id
            }

        return {"error": "No message or file provided"}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- Knowledge Base Endpoints ---

@api_router.post("/knowledge/add")
async def add_knowledge(
    content: str = Body(..., embed=True),
    tags: List[str] = Body([], embed=True),
    source: str = Body("USER", embed=True)
):
    try:
        id = add_knowledge_candidate(content, tags, source)
        return {"id": id, "message": "Knowledge candidate added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/knowledge/list")
async def list_knowledge(status: Optional[str] = None):
    try:
        return get_knowledge_entries(status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/knowledge/{id}/approve")
async def approve_knowledge(id: str):
    try:
        approve_knowledge_entry(id)
        return {"message": "Knowledge approved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/knowledge/{id}/reject")
async def reject_knowledge(id: str):
    try:
        reject_knowledge_entry(id)
        return {"message": "Knowledge rejected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/knowledge/search")
async def search_knowledge_endpoint(query: str = Body(..., embed=True)):
    try:
        results = search_knowledge(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/knowledge/{id}")
async def delete_knowledge(id: str):
    """
    Deletes a specific knowledge entry.
    """
    try:
        from app.services.knowledge import delete_knowledge_entry
        delete_knowledge_entry(id)
        return {"message": "Knowledge entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/knowledge/{id}")
async def update_knowledge(
    id: str, 
    content: Optional[str] = Body(None, embed=True),
    tags: Optional[List[str]] = Body(None, embed=True),
    status: Optional[str] = Body(None, embed=True)
):
    """
    Updates a specific knowledge entry (content, tags, or status).
    """
    try:
        from app.services.knowledge import update_knowledge_entry
        update_knowledge_entry(id, content, tags, status)
        return {"message": "Knowledge entry updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Dashboard & Archive Endpoints ---

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """
    Returns aggregated statistics from analysis history.
    """
    history_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "history.json")
    
    if not os.path.exists(history_file):
        return {
            "total_training_time": 0,
            "focus_areas": [],
            "style_score": 0,
            "recent_records": []
        }
        
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            history = json.load(f)
            
        # 1. Total Training Time (Simulated: 1 video = 10 mins for now)
        video_count = sum(1 for item in history if item.get("type") == "video")
        total_training_time = video_count * 10 
        
        # 2. Focus Areas (Use Top 3 Issues if available, otherwise fallback to Cons)
        all_issues = []
        for item in history:
            if item.get("type") == "video":
                data = item.get("data", {}).get("analysis", {})
                
                # Priority: Top Issues Tags
                if "top_issues" in data:
                    for issue in data["top_issues"]:
                        if "tag_name" in issue:
                            # Clean up tag name (remove English translation in parenthesis if present)
                            tag = issue["tag_name"].split("(")[0].strip()
                            all_issues.append(tag)
                            
                # Fallback: Cons
                elif "analysis_report" in data:
                     cons = data["analysis_report"].get("cons", [])
                     all_issues.extend(cons)

        # Simple frequency count for focus areas
        focus_areas = []
        if all_issues:
            counts = Counter(all_issues)
            focus_areas = [item[0] for item in counts.most_common(5)]
        
        if not focus_areas and video_count > 0:
             focus_areas = ["基础动作", "体能储备", "战术意识"] # Fallback if analysis didn't return cons
        elif not focus_areas:
             focus_areas = []

        # 3. Style Score
        # Calculate average of total_score from OOTD analysis
        style_scores = []
        for item in history:
            if item.get("type") == "style":
                data = item.get("data", {})
                if "total_score" in data:
                    style_scores.append(data["total_score"])
        
        style_score = int(sum(style_scores) / len(style_scores)) if style_scores else 0
        
        # 4. Recent Records (Top 5)
        recent_records = []
        for item in history[:5]:
            record = {
                "id": item.get("id"),
                "date": item.get("created_at", "").split("T")[0],
                "type": "视频分析" if item.get("type") == "video" else "穿搭分析",
                "result": "分析完成" 
            }
            
            data = item.get("data", {})
            if item.get("type") == "video":
                 if "analysis_report" in data:
                     info = data["analysis_report"].get("video_info", "羽毛球视频")
                     record["result"] = info[:15] + "..." if len(info) > 15 else info
            elif item.get("type") == "style":
                if "one_line_summary" in data:
                    record["result"] = data["one_line_summary"][:15] + "..."
                elif "message" in data:
                    record["result"] = data["message"][:10] + "..."
            
            recent_records.append(record)

        return {
            "total_training_time": total_training_time,
            "focus_areas": focus_areas,
            "style_score": style_score,
            "recent_records": recent_records
        }

    except Exception as e:
        print(f"Error reading history: {e}")
        return {
            "total_training_time": 0,
            "focus_areas": ["数据读取错误"],
            "style_score": 0,
            "recent_records": []
        }

@api_router.get("/documentation")
async def get_documentation_endpoint():
    """
    Returns the project documentation from the dynamic store.
    """
    try:
        from app.services.documentation import get_all_docs
        return get_all_docs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/documentation/{id}/section")
async def update_doc_section_endpoint(
    id: str,
    title: str = Body(..., embed=True),
    content: str = Body(..., embed=True),
    append: bool = Body(True, embed=True)
):
    """
    Updates or appends content to a specific section of a documentation entry.
    """
    try:
        from app.services.documentation import update_doc_section
        success = update_doc_section(id, title, content, append)
        if not success:
            raise HTTPException(status_code=404, detail="Documentation entry not found")
        return {"message": "Section updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/technical-guides")
async def get_technical_guides():
    """
    Returns the list of technical guides.
    """
    guides_file = os.path.join(get_data_dir(), "technical_guides.json")
    
    # Try to find the file in the source tree first (read-only)
    source_guides_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "technical_guides.json")
    
    if os.path.exists(source_guides_file):
        try:
            with open(source_guides_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading source technical guides: {e}")
            
    # Fallback to get_data_dir() if source not found (e.g. if we decide to make it writable later)
    if os.path.exists(guides_file):
        try:
            with open(guides_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading technical guides: {e}")

    return []

@api_router.get("/sessions")
async def get_sessions_endpoint():
    """
    Returns all chat sessions.
    """
    try:
        from app.services.history import get_all_sessions
        return get_all_sessions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sessions/{id}")
async def get_session_detail(id: str):
    """
    Returns full details for a specific session.
    """
    try:
        from app.services.history import get_session
        session = get_session(id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/sessions/{id}")
async def delete_session_endpoint(id: str):
    try:
        from app.services.history import delete_session
        success = delete_session(id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/archives")
async def get_archives_endpoint():
    """
    Returns all analysis archives (Reports).
    """
    try:
        from app.services.history import get_all_archives
        archives = get_all_archives()
        
        # Format for frontend
        formatted_archives = []
        for item in archives:
            # Safe parsing of date
            date_str = ""
            if item.get("created_at"):
                date_str = item.get("created_at").split("T")[0]

            record = {
                "id": item.get("id"),
                "date": date_str,
                "type": "video" if item.get("type") == "video" else "style",
                "title": item.get("result", "分析报告"),
                "details": {}
            }
            
            data = item.get("data", {})
            if item.get("type") == "video":
                 if "analysis" in data: 
                     data = data["analysis"] 
                     
                 if "analysis_report" in data:
                     # Check for video info and duration
                     video_info = data["analysis_report"].get("video_info", "羽毛球视频")
                     duration = data["analysis_report"].get("video_duration", "")
                     
                     # Append duration to title if available and not already there
                     if duration and duration not in video_info:
                         record["title"] = f"{video_info} ({duration})"
                     else:
                         record["title"] = video_info

                     record["details"] = {
                         "pros": data["analysis_report"].get("pros", [])[:2],
                         "cons": data["analysis_report"].get("cons", [])[:2],
                         "duration": duration
                     }
            elif item.get("type") == "style":
                if "message" in data:
                    record["details"] = {
                        "analysis": str(data.get("analysis", ""))[:100] + "..."
                    }
                if "style_tags" in data:
                    if "details" not in record: record["details"] = {}
                    record["details"]["tags"] = data["style_tags"]
            
            formatted_archives.append(record)
            
        return formatted_archives

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/archives/{id}")
async def get_archive_detail(id: str):
    """
    Returns full details for a specific archive record.
    """
    try:
        from app.services.history import get_archive
        record = get_archive(id)
        if not record:
            raise HTTPException(status_code=404, detail="Archive not found")
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/archives/{id}")
async def delete_archive_endpoint(id: str):
    """
    Deletes a specific archive record.
    """
    try:
        from app.services.history import delete_archive
        success = delete_archive(id)
        if not success:
             raise HTTPException(status_code=404, detail="Archive not found")
        return {"message": "Archive deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
