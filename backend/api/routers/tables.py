"""
Tables router for the STTM API.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Query
from backend.service import mapping_service
from backend.api.schemas.table import Table

router = APIRouter()

@router.get("/source", response_model=List[Table])
async def get_source_tables():
    """
    Get all source tables.
    """
    try:
        return mapping_service.get_source_tables()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/target", response_model=List[Table])
async def get_target_tables():
    """
    Get all target tables.
    """
    try:
        return mapping_service.get_target_tables()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 