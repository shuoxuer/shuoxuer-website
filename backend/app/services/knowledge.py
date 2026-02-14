import json
import os
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime
from app.core.config import get_data_dir
import logging

# We will import get_embedding inside functions to avoid circular imports if needed
# but since qwen.py is a service, it's better to import it here.
# However, qwen.py imports knowledge to use search_knowledge, so we have a circular import.
# To resolve this, we will pass the embedding function or import it inside the method.
# For now, let's use local import inside methods.

logger = logging.getLogger(__name__)

KNOWLEDGE_FILE = os.path.join(get_data_dir(), "knowledge_base.json")

def load_knowledge_base() -> List[Dict]:
    if not os.path.exists(KNOWLEDGE_FILE):
        return []
    try:
        with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_knowledge_base(data: List[Dict]):
    with open(KNOWLEDGE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def add_knowledge_candidate(content: str, tags: List[str] = [], source: str = "AI_CHAT") -> str:
    kb = load_knowledge_base()
    
    # Generate ID
    new_id = f"KB_{len(kb) + 1:04d}"
    
    entry = {
        "id": new_id,
        "content": content,
        "tags": tags,
        "status": "pending", # pending, approved, rejected
        "source": source,
        "created_at": datetime.now().isoformat(),
        "embedding": None # Will be generated upon approval to save costs/time or can be done now.
    }
    
    kb.insert(0, entry)
    save_knowledge_base(kb)
    return new_id

def approve_knowledge_entry(id: str, reviewer: str = "Admin"):
    from app.services.qwen import get_embedding
    
    kb = load_knowledge_base()
    for item in kb:
        if item["id"] == id:
            item["status"] = "approved"
            item["reviewed_by"] = reviewer
            item["reviewed_at"] = datetime.now().isoformat()
            # Generate embedding
            if not item.get("embedding"):
                item["embedding"] = get_embedding(item["content"])
            break
            
    save_knowledge_base(kb)

def reject_knowledge_entry(id: str):
    kb = load_knowledge_base()
    # Filter out or mark rejected
    # Ideally mark rejected to keep history
    for item in kb:
        if item["id"] == id:
            item["status"] = "rejected"
            break
    save_knowledge_base(kb)

def delete_knowledge_entry(id: str):
    kb = load_knowledge_base()
    initial_len = len(kb)
    kb = [item for item in kb if item["id"] != id]
    if len(kb) == initial_len:
        raise Exception("Knowledge entry not found")
    save_knowledge_base(kb)

def update_knowledge_entry(id: str, content: Optional[str] = None, tags: Optional[List[str]] = None, status: Optional[str] = None):
    from app.services.qwen import get_embedding

    kb = load_knowledge_base()
    updated = False
    
    for item in kb:
        if item["id"] == id:
            if content is not None:
                item["content"] = content
                # If content changes, invalidate embedding unless it's just a small fix? 
                # Better to re-generate if approved.
                if item["status"] == "approved":
                    item["embedding"] = get_embedding(content)
            
            if tags is not None:
                item["tags"] = tags
                
            if status is not None:
                item["status"] = status
                # If moving to approved, ensure embedding
                if status == "approved" and not item.get("embedding"):
                    item["embedding"] = get_embedding(item["content"])
                    
            item["updated_at"] = datetime.now().isoformat()
            updated = True
            break
            
    if not updated:
        raise Exception("Knowledge entry not found")
        
    save_knowledge_base(kb)
    return True

def get_knowledge_entries(status: Optional[str] = None) -> List[Dict]:
    kb = load_knowledge_base()
    if status:
        return [item for item in kb if item.get("status") == status]
    return kb

def search_knowledge(query: str, top_k: int = 3) -> List[Dict]:
    """
    Search knowledge base using vector similarity (cosine) + keyword matching (simple).
    """
    from app.services.qwen import get_embedding
    
    kb = load_knowledge_base()
    approved_kb = [item for item in kb if item.get("status") == "approved" and item.get("embedding")]
    
    if not approved_kb:
        return []

    # 1. Get query embedding
    query_embedding = get_embedding(query)
    if not query_embedding:
        return []
        
    query_vec = np.array(query_embedding)
    
    # 2. Calculate similarities
    results = []
    for item in approved_kb:
        doc_vec = np.array(item["embedding"])
        # Cosine similarity
        similarity = np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec))
        results.append({
            "id": item["id"],
            "content": item["content"],
            "score": float(similarity),
            "tags": item.get("tags", [])
        })
        
    # 3. Sort and return top_k
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]

def extract_knowledge_from_text(text: str) -> Optional[Dict]:
    """
    Uses LLM to extract structured knowledge from text.
    """
    # This would be called after a chat response
    # Implementation deferred for now to keep response fast
    pass
