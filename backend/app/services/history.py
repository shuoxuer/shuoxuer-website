import json
import os
import uuid
from datetime import datetime
from app.core.config import get_data_dir
from typing import List, Dict, Optional

def get_history_file():
    return os.path.join(get_data_dir(), "sessions.json")

def _load_sessions():
    history_file = get_history_file()
    if not os.path.exists(history_file):
        return []
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def _save_sessions(sessions):
    with open(get_history_file(), "w", encoding="utf-8") as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)

def create_session(title: str = "新对话"):
    sessions = _load_sessions()
    session = {
        "id": str(uuid.uuid4()),
        "title": title,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "messages": []
    }
    sessions.insert(0, session)
    _save_sessions(sessions)
    return session

def get_session(session_id: str):
    sessions = _load_sessions()
    for s in sessions:
        if s["id"] == session_id:
            return s
    return None

def get_all_sessions():
    sessions = _load_sessions()
    # Return summary list (without heavy messages if needed, but for now full is fine for small app)
    return sessions

def update_session_title(session_id: str, title: str):
    sessions = _load_sessions()
    for s in sessions:
        if s["id"] == session_id:
            s["title"] = title
            s["updated_at"] = datetime.now().isoformat()
            _save_sessions(sessions)
            return s
    return None

def add_message(session_id: str, role: str, content: str, type: str = "text", card_data: dict = None):
    sessions = _load_sessions()
    target_session = None
    
    # If session_id is None or not found, create new (handled by caller usually, but safe fallback)
    if not session_id:
        # Create new session implicitly
        new_session = create_session(title=content[:20] if content else "新对话")
        session_id = new_session["id"]
        # Reload sessions to get the new one in the list
        sessions = _load_sessions()

    for s in sessions:
        if s["id"] == session_id:
            target_session = s
            break
    
    if not target_session:
        return None

    message = {
        "id": str(uuid.uuid4()),
        "role": role,
        "content": content,
        "type": type,
        "cardData": card_data,
        "timestamp": datetime.now().isoformat()
    }
    
    target_session["messages"].append(message)
    target_session["updated_at"] = datetime.now().isoformat()
    
    # Auto-update title if it's the first user message and title is default
    if role == "user" and len(target_session["messages"]) <= 2 and target_session["title"] == "新对话":
         target_session["title"] = content[:30]

    _save_sessions(sessions)
    return message

def delete_session(session_id: str):
    sessions = _load_sessions()
    initial_len = len(sessions)
    sessions = [s for s in sessions if s["id"] != session_id]
    if len(sessions) < initial_len:
        _save_sessions(sessions)
        return True
    return False

# --- Archive / Report Management (Distinct from Sessions) ---

def get_archives_file():
    return os.path.join(get_data_dir(), "archives.json")

def _load_archives():
    file_path = get_archives_file()
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def _save_archives(archives):
    with open(get_archives_file(), "w", encoding="utf-8") as f:
        json.dump(archives, f, ensure_ascii=False, indent=2)

def save_archive_entry(type: str, result: str, data: dict):
    archives = _load_archives()
    
    entry = {
        "id": str(uuid.uuid4()),
        "type": type, # 'video' or 'style'
        "created_at": datetime.now().isoformat(),
        "result": result, # Summary/Title
        "data": data # Full analysis data
    }
    
    archives.insert(0, entry)
    _save_archives(archives)
    return entry["id"]

def get_all_archives():
    return _load_archives()

def get_archive(archive_id: str):
    archives = _load_archives()
    for a in archives:
        if a["id"] == archive_id:
            return a
    return None

def delete_archive(archive_id: str):
    archives = _load_archives()
    initial_len = len(archives)
    archives = [a for a in archives if a["id"] != archive_id]
    if len(archives) < initial_len:
        _save_archives(archives)
        return True
    return False
