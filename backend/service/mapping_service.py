"""
Mapping service module for the STTM application.
This module provides business logic for managing source-to-target mappings.
"""
from typing import Dict, List, Optional, Union
from datetime import datetime

# Import dummy data cache for initial implementation
from backend.cache import dummy_data

# Flag to determine whether to use dummy data or ORM
USE_DUMMY_DATA = True

def get_all_mappings() -> List[Dict]:
    """
    Get all mappings.
    
    Returns:
        List[Dict]: A list of all mappings.
    """
    if USE_DUMMY_DATA:
        return dummy_data.get_all_mappings()
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_mapping(mapping_id: int) -> Optional[Dict]:
    """
    Get a mapping by ID.
    
    Args:
        mapping_id (int): The ID of the mapping to retrieve.
        
    Returns:
        Optional[Dict]: The mapping if found, None otherwise.
    """
    if USE_DUMMY_DATA:
        return dummy_data.get_mapping(mapping_id)
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def create_mapping(mapping_data: Dict) -> Dict:
    """
    Create a new mapping.
    
    Args:
        mapping_data (Dict): The mapping data.
        
    Returns:
        Dict: The created mapping.
    """
    # Validate mapping data
    required_fields = [
        "source_table_id", "source_column_id", 
        "target_table_id", "target_column_id"
    ]
    
    for field in required_fields:
        if field not in mapping_data:
            raise ValueError(f"Missing required field: {field}")
    
    # Set default values if not provided
    if "status" not in mapping_data:
        mapping_data["status"] = "Draft"
    
    if "description" not in mapping_data:
        mapping_data["description"] = ""
    
    if USE_DUMMY_DATA:
        return dummy_data.add_mapping(mapping_data)
    else:
        # TODO: Implement ORM-based creation
        raise NotImplementedError("ORM-based creation not implemented yet")

def update_mapping(mapping_id: int, mapping_data: Dict) -> Optional[Dict]:
    """
    Update an existing mapping.
    
    Args:
        mapping_id (int): The ID of the mapping to update.
        mapping_data (Dict): The updated mapping data.
        
    Returns:
        Optional[Dict]: The updated mapping if found, None otherwise.
    """
    # Get the existing mapping
    existing_mapping = get_mapping(mapping_id)
    if not existing_mapping:
        return None
    
    if USE_DUMMY_DATA:
        return dummy_data.update_mapping(mapping_id, mapping_data)
    else:
        # TODO: Implement ORM-based update
        raise NotImplementedError("ORM-based update not implemented yet")

def delete_mapping(mapping_id: int) -> bool:
    """
    Delete a mapping.
    
    Args:
        mapping_id (int): The ID of the mapping to delete.
        
    Returns:
        bool: True if the mapping was deleted, False otherwise.
    """
    if USE_DUMMY_DATA:
        return dummy_data.delete_mapping(mapping_id)
    else:
        # TODO: Implement ORM-based deletion
        raise NotImplementedError("ORM-based deletion not implemented yet")

def get_mappings_by_release(release_id: int) -> List[Dict]:
    """
    Get all mappings for a specific release.
    
    Args:
        release_id (int): The ID of the release.
        
    Returns:
        List[Dict]: A list of mappings for the specified release.
    """
    if USE_DUMMY_DATA:
        all_mappings = dummy_data.get_all_mappings()
        return [m for m in all_mappings if m.get("release_id") == release_id]
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_mappings_by_status(status: str) -> List[Dict]:
    """
    Get all mappings with a specific status.
    
    Args:
        status (str): The status to filter by.
        
    Returns:
        List[Dict]: A list of mappings with the specified status.
    """
    if USE_DUMMY_DATA:
        all_mappings = dummy_data.get_all_mappings()
        return [m for m in all_mappings if m.get("status") == status]
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_source_tables() -> List[Dict]:
    """
    Get all source tables.
    
    Returns:
        List[Dict]: A list of all source tables.
    """
    if USE_DUMMY_DATA:
        return dummy_data.source_tables_cache
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_source_columns(table_id: Optional[int] = None) -> List[Dict]:
    """
    Get source columns, optionally filtered by table ID.
    
    Args:
        table_id (Optional[int]): The ID of the table to filter by.
        
    Returns:
        List[Dict]: A list of source columns.
    """
    if USE_DUMMY_DATA:
        if table_id is not None:
            return [c for c in dummy_data.source_columns_cache if c.get("table_id") == table_id]
        return dummy_data.source_columns_cache
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_target_tables() -> List[Dict]:
    """
    Get all target tables.
    
    Returns:
        List[Dict]: A list of all target tables.
    """
    if USE_DUMMY_DATA:
        return dummy_data.target_tables_cache
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_target_columns(table_id: Optional[int] = None) -> List[Dict]:
    """
    Get target columns, optionally filtered by table ID.
    
    Args:
        table_id (Optional[int]): The ID of the table to filter by.
        
    Returns:
        List[Dict]: A list of target columns.
    """
    if USE_DUMMY_DATA:
        if table_id is not None:
            return [c for c in dummy_data.target_columns_cache if c.get("table_id") == table_id]
        return dummy_data.target_columns_cache
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_releases() -> List[Dict]:
    """
    Get all releases.
    
    Returns:
        List[Dict]: A list of all releases.
    """
    if USE_DUMMY_DATA:
        return dummy_data.releases_cache
    else:
        # TODO: Implement ORM-based retrieval
        raise NotImplementedError("ORM-based retrieval not implemented yet")

def get_enriched_mappings() -> List[Dict]:
    """
    Get all mappings with enriched information (table and column names).
    
    Returns:
        List[Dict]: A list of enriched mappings.
    """
    mappings = get_all_mappings()
    source_tables = {t["id"]: t for t in get_source_tables()}
    source_columns = {c["id"]: c for c in get_source_columns()}
    target_tables = {t["id"]: t for t in get_target_tables()}
    target_columns = {c["id"]: c for c in get_target_columns()}
    releases = {r["id"]: r for r in get_releases()}
    
    enriched_mappings = []
    for mapping in mappings:
        enriched = mapping.copy()
        
        # Add source table and column information
        source_table_id = mapping.get("source_table_id")
        source_column_id = mapping.get("source_column_id")
        if source_table_id and source_table_id in source_tables:
            enriched["source_table_name"] = source_tables[source_table_id]["name"]
        if source_column_id and source_column_id in source_columns:
            enriched["source_column_name"] = source_columns[source_column_id]["name"]
        
        # Add target table and column information
        target_table_id = mapping.get("target_table_id")
        target_column_id = mapping.get("target_column_id")
        if target_table_id and target_table_id in target_tables:
            enriched["target_table_name"] = target_tables[target_table_id]["name"]
        if target_column_id and target_column_id in target_columns:
            enriched["target_column_name"] = target_columns[target_column_id]["name"]
        
        # Add release information
        release_id = mapping.get("release_id")
        if release_id and release_id in releases:
            enriched["release_name"] = releases[release_id]["name"]
        
        enriched_mappings.append(enriched)
    
    return enriched_mappings 