"""
Column schemas for the STTM API.
"""
from typing import Optional, List
from pydantic import BaseModel, Field

class ColumnBase(BaseModel):
    """Base schema for columns."""
    table_id: int = Field(..., description="ID of the table")
    name: str = Field(..., description="Name of the column")
    data_type: str = Field(..., description="Data type of the column")
    description: Optional[str] = Field("", description="Description of the column")

class Column(ColumnBase):
    """Schema for a column."""
    id: int = Field(..., description="ID of the column")

    class Config:
        """Pydantic configuration."""
        from_attributes = True 