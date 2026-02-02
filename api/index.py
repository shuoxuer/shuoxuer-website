import os
import sys

# Add the backend directory to sys.path so that 'app' module can be found
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.main import app

# This is required for Vercel to find the app instance
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
