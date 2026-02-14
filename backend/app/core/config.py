from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os
import tempfile

class Settings(BaseSettings):
    PROJECT_NAME: str = "Badminton AI Coach"
    VERSION: str = "2.0"
    API_V1_STR: str = "/api/v1"
    
    # Qwen API Key
    QWEN_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

@lru_cache
def get_settings():
    return Settings()

def get_data_dir():
    """
    Returns the data directory path.
    Uses /tmp on Vercel/Serverless environments where filesystem is read-only.
    """
    if os.environ.get("VERCEL"):
        data_dir = os.path.join(tempfile.gettempdir(), "lssq_data")
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
    else:
        # Local development: backend/data
        # Assumes config.py is in backend/app/core/config.py
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        data_dir = os.path.join(base_dir, "data")
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
