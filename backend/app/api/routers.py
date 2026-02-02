from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from app.services.gemini import analyze_video, analyze_photo, chat_with_coach
from typing import Optional, Dict
import os
import json
from collections import Counter

api_router = APIRouter()

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
    message: str = Body(..., embed=True),
    context: Optional[Dict] = Body(None)
):
    """
    Chat with the AI Pocket Assistant.
    """
    try:
        result = await chat_with_coach(message, context)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@api_router.get("/archives")
async def get_archives():
    """
    Returns all analysis history records.
    """
    history_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "history.json")
    
    if not os.path.exists(history_file):
        return []
        
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            history = json.load(f)
            
        # Format for frontend
        archives = []
        for item in history:
            record = {
                "id": item.get("id"),
                "date": item.get("created_at", "").split("T")[0],
                "type": "video" if item.get("type") == "video" else "style",
                "title": "分析报告",
                "details": {}
            }
            
            data = item.get("data", {})
            if item.get("type") == "video":
                 # Check for new structure first
                 if "analysis" in data: 
                     data = data["analysis"] # Handle case where it might be wrapped
                     
                 if "analysis_report" in data:
                     record["title"] = data["analysis_report"].get("video_info", "羽毛球视频分析")
                     record["details"] = {
                         "pros": data["analysis_report"].get("pros", [])[:2],
                         "cons": data["analysis_report"].get("cons", [])[:2]
                     }
            elif item.get("type") == "style":
                if "one_line_summary" in data:
                    record["title"] = data["one_line_summary"]
                    record["details"] = {"tags": data.get("style_tags", [])}
                elif "message" in data:
                    record["title"] = data["message"]
                    record["details"] = {
                        "analysis": str(data.get("analysis", ""))[:100] + "..."
                    }
            
            archives.append(record)
            
        return archives

    except Exception as e:
        print(f"Error reading archives: {e}")
        return []

@api_router.get("/archives/{id}")
async def get_archive_detail(id: str):
    """
    Returns full details for a specific history record.
    """
    history_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "history.json")
    
    if not os.path.exists(history_file):
        raise HTTPException(status_code=404, detail="Archive not found")
        
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            history = json.load(f)
            
        record = next((item for item in history if item.get("id") == id), None)
        
        if not record:
            raise HTTPException(status_code=404, detail="Archive not found")
            
        return record
        
    except Exception as e:
        print(f"Error reading archive detail: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/archives/{id}")
async def delete_archive(id: str):
    """
    Deletes a specific history record.
    """
    history_file = os.path.join(get_data_dir(), "history.json")
    
    if not os.path.exists(history_file):
        raise HTTPException(status_code=404, detail="Archive not found")
        
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            history = json.load(f)
            
        initial_len = len(history)
        history = [item for item in history if item.get("id") != id]
        
        if len(history) == initial_len:
             raise HTTPException(status_code=404, detail="Archive not found")
             
        with open(history_file, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
            
        return {"message": "Archive deleted successfully"}

    except Exception as e:
        print(f"Error deleting archive: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
