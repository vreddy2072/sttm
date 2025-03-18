"""
Release schemas for the STTM API.
"""
from typing import Optional, List
from pydantic import BaseModel, Field

class ReleaseBase(BaseModel):
    """Base schema for releases."""
    name: str = Field(..., description="Name of the release")
    description: Optional[str] = Field("", description="Description of the release")
    status: str = Field(..., description="Status of the release")

class Release(ReleaseBase):
    """Schema for a release."""
    id: int = Field(..., description="ID of the release")

    class Config:
        """Pydantic configuration."""
        from_attributes = True 