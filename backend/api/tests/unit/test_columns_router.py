"""
Unit tests for the columns router.
"""
import pytest
from fastapi.testclient import TestClient
from backend.api.app import app

client = TestClient(app)

def test_get_source_columns():
    """Test getting source columns."""
    response = client.get("/api/columns/source")
    assert response.status_code == 200
    columns = response.json()
    assert isinstance(columns, list)
    assert len(columns) > 0
    
    # Check that each column has the expected fields
    for column in columns:
        assert "id" in column
        assert "table_id" in column
        assert "name" in column
        assert "data_type" in column
        assert "description" in column

def test_get_source_columns_by_table():
    """Test getting source columns filtered by table ID."""
    response = client.get("/api/columns/source?table_id=1")
    assert response.status_code == 200
    columns = response.json()
    assert isinstance(columns, list)
    
    # Check that all columns have the expected table ID
    for column in columns:
        assert column["table_id"] == 1

def test_get_target_columns():
    """Test getting target columns."""
    response = client.get("/api/columns/target")
    assert response.status_code == 200
    columns = response.json()
    assert isinstance(columns, list)
    assert len(columns) > 0
    
    # Check that each column has the expected fields
    for column in columns:
        assert "id" in column
        assert "table_id" in column
        assert "name" in column
        assert "data_type" in column
        assert "description" in column

def test_get_target_columns_by_table():
    """Test getting target columns filtered by table ID."""
    response = client.get("/api/columns/target?table_id=1")
    assert response.status_code == 200
    columns = response.json()
    assert isinstance(columns, list)
    
    # Check that all columns have the expected table ID
    for column in columns:
        assert column["table_id"] == 1 