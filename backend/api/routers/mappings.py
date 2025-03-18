"""
Mappings router for the STTM API.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Path
from backend.service import mapping_service
from backend.api.schemas.mapping import Mapping, MappingCreate, MappingUpdate, EnrichedMapping

router = APIRouter()

@router.get("/", response_model=List[EnrichedMapping])
async def get_mappings(
    release_id: Optional[int] = Query(None, description="Filter by release ID"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """
    Get all mappings, optionally filtered by release ID or status.
    """
    try:
        if release_id is not None:
            mappings = mapping_service.get_mappings_by_release(release_id)
        elif status is not None:
            mappings = mapping_service.get_mappings_by_status(status)
        else:
            mappings = mapping_service.get_enriched_mappings()
        return mappings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/enriched", response_model=List[EnrichedMapping])
async def get_enriched_mappings():
    """
    Get all mappings with enriched information (table and column names).
    """
    try:
        return mapping_service.get_enriched_mappings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{mapping_id}", response_model=Mapping)
async def get_mapping(mapping_id: int = Path(..., description="The ID of the mapping to retrieve")):
    """
    Get a mapping by ID.
    """
    try:
        mapping = mapping_service.get_mapping(mapping_id)
        if mapping is None:
            raise HTTPException(status_code=404, detail=f"Mapping with ID {mapping_id} not found")
        return mapping
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Mapping, status_code=201)
async def create_mapping(mapping: MappingCreate):
    """
    Create a new mapping.
    """
    try:
        return mapping_service.create_mapping(mapping.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{mapping_id}", response_model=Mapping)
async def update_mapping(
    mapping: MappingUpdate,
    mapping_id: int = Path(..., description="The ID of the mapping to update")
):
    """
    Update a mapping.
    """
    try:
        updated_mapping = mapping_service.update_mapping(mapping_id, mapping.model_dump(exclude_unset=True))
        if updated_mapping is None:
            raise HTTPException(status_code=404, detail=f"Mapping with ID {mapping_id} not found")
        return updated_mapping
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{mapping_id}", status_code=204)
async def delete_mapping(mapping_id: int = Path(..., description="The ID of the mapping to delete")):
    """
    Delete a mapping.
    """
    try:
        result = mapping_service.delete_mapping(mapping_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Mapping with ID {mapping_id} not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 