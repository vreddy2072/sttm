"""
Mapping schemas for the STTM API.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class MappingBase(BaseModel):
    """Base schema for mappings."""
    source_table_id: int = Field(..., description="ID of the source table")
    source_column_id: int = Field(..., description="ID of the source column")
    target_table_id: int = Field(..., description="ID of the target table")
    target_column_id: int = Field(..., description="ID of the target column")
    release_id: Optional[int] = Field(None, description="ID of the release")
    jira_ticket: Optional[str] = Field(None, description="JIRA ticket reference")
    status: Optional[str] = Field("Draft", description="Status of the mapping")
    description: Optional[str] = Field("", description="Description of the mapping")

class MappingCreate(MappingBase):
    """Schema for creating a new mapping."""
    pass

class MappingUpdate(BaseModel):
    """Schema for updating a mapping."""
    source_table_id: Optional[int] = Field(None, description="ID of the source table")
    source_column_id: Optional[int] = Field(None, description="ID of the source column")
    target_table_id: Optional[int] = Field(None, description="ID of the target table")
    target_column_id: Optional[int] = Field(None, description="ID of the target column")
    release_id: Optional[int] = Field(None, description="ID of the release")
    jira_ticket: Optional[str] = Field(None, description="JIRA ticket reference")
    status: Optional[str] = Field(None, description="Status of the mapping")
    description: Optional[str] = Field(None, description="Description of the mapping")

class Mapping(MappingBase):
    """Schema for a mapping."""
    id: int = Field(..., description="ID of the mapping")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")

    class Config:
        """Pydantic configuration."""
        from_attributes = True

class EnrichedMapping(Mapping):
    """Schema for an enriched mapping with additional information."""
    source_table_name: Optional[str] = Field(None, description="Name of the source table")
    source_column_name: Optional[str] = Field(None, description="Name of the source column")
    target_table_name: Optional[str] = Field(None, description="Name of the target table")
    target_column_name: Optional[str] = Field(None, description="Name of the target column")
    release_name: Optional[str] = Field(None, description="Name of the release") 