"""
Table schemas for the STTM API.
"""
from typing import Optional, List
from pydantic import BaseModel, Field

class TableBase(BaseModel):
    """Base schema for tables."""
    name: str = Field(..., description="Name of the table")
    description: Optional[str] = Field("", description="Description of the table")

class Table(TableBase):
    """Schema for a table."""
    id: int = Field(..., description="ID of the table")

    class Config:
        """Pydantic configuration."""
        from_attributes = True 