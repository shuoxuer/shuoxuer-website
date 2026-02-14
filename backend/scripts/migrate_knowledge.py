import json
import os
import sys
from datetime import datetime

# Add backend directory to sys.path to allow imports if needed, 
# but for this script we can just use standard file I/O
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DOCS_FILE = os.path.join(DATA_DIR, "documentation.json")
KNOWLEDGE_FILE = os.path.join(DATA_DIR, "knowledge_base.json")

def migrate():
    print("Starting migration...")
    
    if not os.path.exists(DOCS_FILE):
        print(f"Documentation file not found: {DOCS_FILE}")
        return

    try:
        with open(DOCS_FILE, "r", encoding="utf-8") as f:
            docs = json.load(f)
    except Exception as e:
        print(f"Error reading documentation.json: {e}")
        return

    knowledge_base = []
    if os.path.exists(KNOWLEDGE_FILE):
        try:
            with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
                knowledge_base = json.load(f)
        except:
            knowledge_base = []

    # Create a set of existing IDs to avoid duplicates
    existing_ids = set(item["id"] for item in knowledge_base)
    
    count = 0
    for item in docs:
        if item["id"] in existing_ids:
            continue
            
        new_entry = {
            "id": item["id"],
            "content": f"{item['title']}: {item['content']}",
            "tags": item.get("tags", []),
            "status": "approved",
            "source": "MIGRATION_FROM_DOCS",
            "created_at": datetime.now().isoformat(),
            "reviewed_by": "SYSTEM",
            "reviewed_at": datetime.now().isoformat(),
            "embedding": None 
        }
        
        knowledge_base.append(new_entry)
        count += 1

    with open(KNOWLEDGE_FILE, "w", encoding="utf-8") as f:
        json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
        
    print(f"Migration complete. Added {count} new entries.")

if __name__ == "__main__":
    migrate()
