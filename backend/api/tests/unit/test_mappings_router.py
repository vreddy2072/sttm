"""
Unit tests for the mappings router.
"""
import pytest
from fastapi.testclient import TestClient
from backend.api.app import app
from backend.service import mapping_service

client = TestClient(app)

def test_get_mappings():
    """Test getting all mappings."""
    response = client.get("/api/mappings/")
    assert response.status_code == 200
    mappings = response.json()
    assert isinstance(mappings, list)
    assert len(mappings) > 0
    
    # Check that each mapping has the expected fields
    for mapping in mappings:
        assert "id" in mapping
        assert "source_table_id" in mapping
        assert "source_column_id" in mapping
        assert "target_table_id" in mapping
        assert "target_column_id" in mapping
        assert "status" in mapping
        
        # Check that the enriched fields are present
        assert "source_table_name" in mapping
        assert "source_column_name" in mapping
        assert "target_table_name" in mapping
        assert "target_column_name" in mapping

def test_get_mappings_by_release():
    """Test getting mappings filtered by release ID."""
    response = client.get("/api/mappings/?release_id=1")
    assert response.status_code == 200
    mappings = response.json()
    assert isinstance(mappings, list)
    
    # Check that all mappings have the expected release ID
    for mapping in mappings:
        assert mapping["release_id"] == 1

def test_get_mappings_by_status():
    """Test getting mappings filtered by status."""
    response = client.get("/api/mappings/?status=Released")
    assert response.status_code == 200
    mappings = response.json()
    assert isinstance(mappings, list)
    
    # Check that all mappings have the expected status
    for mapping in mappings:
        assert mapping["status"] == "Released"

def test_get_enriched_mappings():
    """Test getting enriched mappings."""
    response = client.get("/api/mappings/enriched")
    assert response.status_code == 200
    mappings = response.json()
    assert isinstance(mappings, list)
    assert len(mappings) > 0
    
    # Check that each mapping has the enriched fields
    for mapping in mappings:
        assert "source_table_name" in mapping
        assert "source_column_name" in mapping
        assert "target_table_name" in mapping
        assert "target_column_name" in mapping

def test_get_mapping():
    """Test getting a mapping by ID."""
    # Get all mappings
    response = client.get("/api/mappings/")
    mappings = response.json()
    
    # Get the first mapping
    first_mapping = mappings[0]
    
    # Get the mapping by ID
    response = client.get(f"/api/mappings/{first_mapping['id']}")
    assert response.status_code == 200
    mapping = response.json()
    
    # Check that we got the expected mapping
    assert mapping["id"] == first_mapping["id"]
    
    # Test getting a non-existent mapping
    response = client.get("/api/mappings/9999")
    assert response.status_code == 404

def test_create_mapping():
    """Test creating a new mapping."""
    # Create a new mapping
    new_mapping = {
        "source_table_id": 1,
        "source_column_id": 3,
        "target_table_id": 1,
        "target_column_id": 3,
        "release_id": 3,
        "jira_ticket": "STTM-401",
        "status": "Draft",
        "description": "Map customer email to customer email",
    }
    
    # Get the initial count of mappings
    response = client.get("/api/mappings/")
    initial_count = len(response.json())
    
    # Create the mapping
    response = client.post("/api/mappings/", json=new_mapping)
    assert response.status_code == 201
    created_mapping = response.json()
    
    # Check that the mapping was created
    assert created_mapping["source_table_id"] == new_mapping["source_table_id"]
    assert created_mapping["source_column_id"] == new_mapping["source_column_id"]
    assert created_mapping["target_table_id"] == new_mapping["target_table_id"]
    assert created_mapping["target_column_id"] == new_mapping["target_column_id"]
    assert created_mapping["release_id"] == new_mapping["release_id"]
    assert created_mapping["jira_ticket"] == new_mapping["jira_ticket"]
    assert created_mapping["status"] == new_mapping["status"]
    assert created_mapping["description"] == new_mapping["description"]
    
    # Check that the mapping was added to the database
    response = client.get("/api/mappings/")
    updated_count = len(response.json())
    assert updated_count == initial_count + 1
    
    # Test creating a mapping with missing required fields
    response = client.post("/api/mappings/", json={
        "source_table_id": 1,
        "source_column_id": 3,
        # Missing target_table_id and target_column_id
    })
    assert response.status_code == 422  # FastAPI returns 422 for validation errors

def test_update_mapping():
    """Test updating a mapping."""
    # Get all mappings
    response = client.get("/api/mappings/")
    mappings = response.json()
    
    # Get the first mapping
    first_mapping = mappings[0]
    
    # Update the mapping
    updated_data = {
        "status": "Updated",
        "description": "Updated description",
    }
    
    response = client.put(f"/api/mappings/{first_mapping['id']}", json=updated_data)
    assert response.status_code == 200
    updated_mapping = response.json()
    
    # Check that the mapping was updated
    assert updated_mapping["id"] == first_mapping["id"]
    assert updated_mapping["status"] == updated_data["status"]
    assert updated_mapping["description"] == updated_data["description"]
    
    # Check that other fields were preserved
    assert updated_mapping["source_table_id"] == first_mapping["source_table_id"]
    assert updated_mapping["source_column_id"] == first_mapping["source_column_id"]
    assert updated_mapping["target_table_id"] == first_mapping["target_table_id"]
    assert updated_mapping["target_column_id"] == first_mapping["target_column_id"]
    
    # Test updating a non-existent mapping
    response = client.put("/api/mappings/9999", json=updated_data)
    assert response.status_code == 404

def test_delete_mapping():
    """Test deleting a mapping."""
    # Create a new mapping to delete
    new_mapping = {
        "source_table_id": 2,
        "source_column_id": 5,
        "target_table_id": 2,
        "target_column_id": 5,
        "release_id": 3,
        "jira_ticket": "STTM-501",
        "status": "Draft",
        "description": "Mapping to delete",
    }
    
    response = client.post("/api/mappings/", json=new_mapping)
    created_mapping = response.json()
    
    # Get the initial count of mappings
    response = client.get("/api/mappings/")
    initial_count = len(response.json())
    
    # Delete the mapping
    response = client.delete(f"/api/mappings/{created_mapping['id']}")
    assert response.status_code == 204
    
    # Check that the mapping was removed from the database
    response = client.get("/api/mappings/")
    updated_count = len(response.json())
    assert updated_count == initial_count - 1
    
    # Check that the mapping is no longer retrievable
    response = client.get(f"/api/mappings/{created_mapping['id']}")
    assert response.status_code == 404
    
    # Test deleting a non-existent mapping
    response = client.delete("/api/mappings/9999")
    assert response.status_code == 404 