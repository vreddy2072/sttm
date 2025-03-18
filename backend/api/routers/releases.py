"""
Releases router for the STTM API.
"""
from typing import List
from fastapi import APIRouter, HTTPException
from backend.service import mapping_service
from backend.api.schemas.release import Release

router = APIRouter()

@router.get("/", response_model=List[Release])
async def get_releases():
    """
    Get all releases.
    """
    try:
        return mapping_service.get_releases()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 