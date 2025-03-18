"""
Unit tests for the tables router.
"""
import pytest
from fastapi.testclient import TestClient
from backend.api.app import app

client = TestClient(app)

def test_get_source_tables():
    """Test getting source tables."""
    response = client.get("/api/tables/source")
    assert response.status_code == 200
    tables = response.json()
    assert isinstance(tables, list)
    assert len(tables) > 0
    
    # Check that each table has the expected fields
    for table in tables:
        assert "id" in table
        assert "name" in table
        assert "description" in table

def test_get_target_tables():
    """Test getting target tables."""
    response = client.get("/api/tables/target")
    assert response.status_code == 200
    tables = response.json()
    assert isinstance(tables, list)
    assert len(tables) > 0
    
    # Check that each table has the expected fields
    for table in tables:
        assert "id" in table
        assert "name" in table
        assert "description" in table 