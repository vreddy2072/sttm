"""
Unit tests for the mapping service.
"""
import pytest
from backend.service import mapping_service
from backend.cache import dummy_data

def test_get_all_mappings():
    """Test getting all mappings."""
    # Get all mappings
    mappings = mapping_service.get_all_mappings()
    
    # Check that we got a list
    assert isinstance(mappings, list)
    
    # Check that the list is not empty
    assert len(mappings) > 0
    
    # Check that each item has the expected fields
    for mapping in mappings:
        assert "id" in mapping
        assert "source_table_id" in mapping
        assert "source_column_id" in mapping
        assert "target_table_id" in mapping
        assert "target_column_id" in mapping
        assert "status" in mapping

def test_get_mapping():
    """Test getting a mapping by ID."""
    # Get all mappings
    mappings = mapping_service.get_all_mappings()
    
    # Get the first mapping
    first_mapping = mappings[0]
    
    # Get the mapping by ID
    mapping = mapping_service.get_mapping(first_mapping["id"])
    
    # Check that we got the expected mapping
    assert mapping is not None
    assert mapping["id"] == first_mapping["id"]
    
    # Test getting a non-existent mapping
    non_existent_mapping = mapping_service.get_mapping(9999)
    assert non_existent_mapping is None

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
    initial_count = len(mapping_service.get_all_mappings())
    
    # Create the mapping
    created_mapping = mapping_service.create_mapping(new_mapping)
    
    # Check that the mapping was created
    assert created_mapping is not None
    assert "id" in created_mapping
    assert created_mapping["source_table_id"] == new_mapping["source_table_id"]
    assert created_mapping["source_column_id"] == new_mapping["source_column_id"]
    assert created_mapping["target_table_id"] == new_mapping["target_table_id"]
    assert created_mapping["target_column_id"] == new_mapping["target_column_id"]
    assert created_mapping["release_id"] == new_mapping["release_id"]
    assert created_mapping["jira_ticket"] == new_mapping["jira_ticket"]
    assert created_mapping["status"] == new_mapping["status"]
    assert created_mapping["description"] == new_mapping["description"]
    
    # Check that the mapping was added to the cache
    updated_count = len(mapping_service.get_all_mappings())
    assert updated_count == initial_count + 1
    
    # Test creating a mapping with missing required fields
    with pytest.raises(ValueError):
        mapping_service.create_mapping({
            "source_table_id": 1,
            "source_column_id": 3,
            # Missing target_table_id and target_column_id
        })

def test_update_mapping():
    """Test updating a mapping."""
    # Get all mappings
    mappings = mapping_service.get_all_mappings()
    
    # Get the first mapping
    first_mapping = mappings[0]
    
    # Update the mapping
    updated_data = {
        "status": "Updated",
        "description": "Updated description",
    }
    
    updated_mapping = mapping_service.update_mapping(first_mapping["id"], updated_data)
    
    # Check that the mapping was updated
    assert updated_mapping is not None
    assert updated_mapping["id"] == first_mapping["id"]
    assert updated_mapping["status"] == updated_data["status"]
    assert updated_mapping["description"] == updated_data["description"]
    
    # Check that other fields were preserved
    assert updated_mapping["source_table_id"] == first_mapping["source_table_id"]
    assert updated_mapping["source_column_id"] == first_mapping["source_column_id"]
    assert updated_mapping["target_table_id"] == first_mapping["target_table_id"]
    assert updated_mapping["target_column_id"] == first_mapping["target_column_id"]
    
    # Test updating a non-existent mapping
    non_existent_update = mapping_service.update_mapping(9999, updated_data)
    assert non_existent_update is None

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
    
    created_mapping = mapping_service.create_mapping(new_mapping)
    
    # Get the initial count of mappings
    initial_count = len(mapping_service.get_all_mappings())
    
    # Delete the mapping
    result = mapping_service.delete_mapping(created_mapping["id"])
    
    # Check that the deletion was successful
    assert result is True
    
    # Check that the mapping was removed from the cache
    updated_count = len(mapping_service.get_all_mappings())
    assert updated_count == initial_count - 1
    
    # Check that the mapping is no longer retrievable
    deleted_mapping = mapping_service.get_mapping(created_mapping["id"])
    assert deleted_mapping is None
    
    # Test deleting a non-existent mapping
    non_existent_delete = mapping_service.delete_mapping(9999)
    assert non_existent_delete is False

def test_get_mappings_by_release():
    """Test getting mappings by release."""
    # Get mappings for release 1
    release_1_mappings = mapping_service.get_mappings_by_release(1)
    
    # Check that we got a list
    assert isinstance(release_1_mappings, list)
    
    # Check that all mappings have the expected release ID
    for mapping in release_1_mappings:
        assert mapping["release_id"] == 1

def test_get_mappings_by_status():
    """Test getting mappings by status."""
    # Get mappings with "Released" status
    released_mappings = mapping_service.get_mappings_by_status("Released")
    
    # Check that we got a list
    assert isinstance(released_mappings, list)
    
    # Check that all mappings have the expected status
    for mapping in released_mappings:
        assert mapping["status"] == "Released"

def test_get_source_tables():
    """Test getting source tables."""
    # Get all source tables
    source_tables = mapping_service.get_source_tables()
    
    # Check that we got a list
    assert isinstance(source_tables, list)
    
    # Check that the list is not empty
    assert len(source_tables) > 0
    
    # Check that each item has the expected fields
    for table in source_tables:
        assert "id" in table
        assert "name" in table
        assert "description" in table

def test_get_source_columns():
    """Test getting source columns."""
    # Get all source columns
    source_columns = mapping_service.get_source_columns()
    
    # Check that we got a list
    assert isinstance(source_columns, list)
    
    # Check that the list is not empty
    assert len(source_columns) > 0
    
    # Check that each item has the expected fields
    for column in source_columns:
        assert "id" in column
        assert "table_id" in column
        assert "name" in column
        assert "data_type" in column
        assert "description" in column
    
    # Test filtering by table ID
    table_1_columns = mapping_service.get_source_columns(1)
    assert all(column["table_id"] == 1 for column in table_1_columns)

def test_get_target_tables():
    """Test getting target tables."""
    # Get all target tables
    target_tables = mapping_service.get_target_tables()
    
    # Check that we got a list
    assert isinstance(target_tables, list)
    
    # Check that the list is not empty
    assert len(target_tables) > 0
    
    # Check that each item has the expected fields
    for table in target_tables:
        assert "id" in table
        assert "name" in table
        assert "description" in table

def test_get_target_columns():
    """Test getting target columns."""
    # Get all target columns
    target_columns = mapping_service.get_target_columns()
    
    # Check that we got a list
    assert isinstance(target_columns, list)
    
    # Check that the list is not empty
    assert len(target_columns) > 0
    
    # Check that each item has the expected fields
    for column in target_columns:
        assert "id" in column
        assert "table_id" in column
        assert "name" in column
        assert "data_type" in column
        assert "description" in column
    
    # Test filtering by table ID
    table_1_columns = mapping_service.get_target_columns(1)
    assert all(column["table_id"] == 1 for column in table_1_columns)

def test_get_releases():
    """Test getting releases."""
    # Get all releases
    releases = mapping_service.get_releases()
    
    # Check that we got a list
    assert isinstance(releases, list)
    
    # Check that the list is not empty
    assert len(releases) > 0
    
    # Check that each item has the expected fields
    for release in releases:
        assert "id" in release
        assert "name" in release
        assert "description" in release
        assert "status" in release

def test_get_enriched_mappings():
    """Test getting enriched mappings."""
    # Get enriched mappings
    enriched_mappings = mapping_service.get_enriched_mappings()
    
    # Check that we got a list
    assert isinstance(enriched_mappings, list)
    
    # Check that the list is not empty
    assert len(enriched_mappings) > 0
    
    # Check that each item has the expected fields
    for mapping in enriched_mappings:
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
        
        # Check release name if release_id is present
        if "release_id" in mapping and mapping["release_id"] is not None:
            assert "release_name" in mapping 