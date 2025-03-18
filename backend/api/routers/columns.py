"""
Columns router for the STTM API.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.service import mapping_service
from backend.api.schemas.column import Column

router = APIRouter()

@router.get("/source", response_model=List[Column])
async def get_source_columns(
    table_id: Optional[int] = Query(None, description="Filter by table ID")
):
    """
    Get source columns, optionally filtered by table ID.
    """
    try:
        return mapping_service.get_source_columns(table_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/target", response_model=List[Column])
async def get_target_columns(
    table_id: Optional[int] = Query(None, description="Filter by table ID")
):
    """
    Get target columns, optionally filtered by table ID.
    """
    try:
        return mapping_service.get_target_columns(table_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 