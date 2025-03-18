"""
Main entry point for the STTM application.
"""
import uvicorn
from backend.api.app import app

if __name__ == "__main__":
    uvicorn.run("backend.api.app:app", host="0.0.0.0", port=8000, reload=True) 