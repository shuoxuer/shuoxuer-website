import json
import os
from app.core.config import get_data_dir
from typing import List, Dict, Optional

def get_docs_file():
    return os.path.join(get_data_dir(), "documentation.json")

def load_documentation():
    file_path = get_docs_file()
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def save_documentation(docs):
    with open(get_docs_file(), "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

def get_all_docs():
    return load_documentation()

def get_doc_by_id(doc_id: str):
    docs = load_documentation()
    for doc in docs:
        if doc["id"] == doc_id:
            return doc
    return None

def update_doc_section(doc_id: str, section_title: str, new_content: str, append: bool = True):
    docs = load_documentation()
    updated = False
    
    for doc in docs:
        if doc["id"] == doc_id:
            # Find section
            if "sections" not in doc:
                doc["sections"] = []
            
            section_found = False
            for section in doc["sections"]:
                if section["title"] == section_title:
                    if append:
                        # Append with a newline if content exists
                        if section["content"]:
                            section["content"] += "\n\n" + new_content
                        else:
                            section["content"] = new_content
                    else:
                        section["content"] = new_content
                    section_found = True
                    break
            
            if not section_found:
                # Create new section if not found
                doc["sections"].append({
                    "title": section_title,
                    "content": new_content
                })
            
            updated = True
            break
    
    if updated:
        save_documentation(docs)
        return True
    return False

def search_docs(query: str):
    docs = load_documentation()
    if not query:
        return docs
    
    results = []
    query = query.lower()
    for doc in docs:
        # Simple search in title, content, tags
        text = (doc.get("title", "") + str(doc.get("content", "")) + str(doc.get("tags", ""))).lower()
        if query in text:
            results.append(doc)
    return results

def find_matching_doc(topic: str):
    """
    Finds a documentation entry that matches the topic (by title or tags).
    """
    if not topic:
        return None
        
    docs = load_documentation()
    topic = topic.lower().strip()
    
    # Direct match first
    for doc in docs:
        title = doc.get("title", "").lower()
        # Handle "Title (Alias)" format
        if topic in title or title in topic:
            return doc
        
        # Check tags
        for tag in doc.get("tags", []):
            if tag.lower() == topic:
                return doc
                
    return None

def append_to_doc_detailed_desc(doc_id: str, content: str):
    """
    Appends content to the '详细说明' section of a doc.
    """
    return update_doc_section(doc_id, "详细说明", content, append=True)
