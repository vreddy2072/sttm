"""
Dummy data cache for the STTM application.
This module provides in-memory storage for testing and development.
"""
from datetime import datetime
from typing import Dict, List, Optional

# In-memory storage for mappings
mappings_cache: List[Dict] = []
mapping_id_counter = 1

# In-memory storage for source tables and columns
source_tables_cache: List[Dict] = [
    {"id": 1, "name": "customer", "description": "Customer information table"},
    {"id": 2, "name": "product", "description": "Product catalog table"},
    {"id": 3, "name": "order", "description": "Order information table"},
]

source_columns_cache: List[Dict] = [
    {"id": 1, "table_id": 1, "name": "customer_id", "data_type": "INTEGER", "description": "Unique customer identifier"},
    {"id": 2, "table_id": 1, "name": "customer_name", "data_type": "VARCHAR", "description": "Customer full name"},
    {"id": 3, "table_id": 1, "name": "email", "data_type": "VARCHAR", "description": "Customer email address"},
    {"id": 4, "table_id": 2, "name": "product_id", "data_type": "INTEGER", "description": "Unique product identifier"},
    {"id": 5, "table_id": 2, "name": "product_name", "data_type": "VARCHAR", "description": "Product name"},
    {"id": 6, "table_id": 2, "name": "price", "data_type": "DECIMAL", "description": "Product price"},
    {"id": 7, "table_id": 3, "name": "order_id", "data_type": "INTEGER", "description": "Unique order identifier"},
    {"id": 8, "table_id": 3, "name": "customer_id", "data_type": "INTEGER", "description": "Customer who placed the order"},
    {"id": 9, "table_id": 3, "name": "order_date", "data_type": "DATE", "description": "Date when order was placed"},
]

# In-memory storage for target tables and columns
target_tables_cache: List[Dict] = [
    {"id": 1, "name": "dim_customer", "description": "Customer dimension table"},
    {"id": 2, "name": "dim_product", "description": "Product dimension table"},
    {"id": 3, "name": "fact_order", "description": "Order fact table"},
]

target_columns_cache: List[Dict] = [
    {"id": 1, "table_id": 1, "name": "customer_key", "data_type": "INTEGER", "description": "Customer surrogate key"},
    {"id": 2, "table_id": 1, "name": "customer_name", "data_type": "VARCHAR", "description": "Customer full name"},
    {"id": 3, "table_id": 1, "name": "email", "data_type": "VARCHAR", "description": "Customer email address"},
    {"id": 4, "table_id": 2, "name": "product_key", "data_type": "INTEGER", "description": "Product surrogate key"},
    {"id": 5, "table_id": 2, "name": "product_name", "data_type": "VARCHAR", "description": "Product name"},
    {"id": 6, "table_id": 2, "name": "price", "data_type": "DECIMAL", "description": "Product price"},
    {"id": 7, "table_id": 3, "name": "order_key", "data_type": "INTEGER", "description": "Order surrogate key"},
    {"id": 8, "table_id": 3, "name": "customer_key", "data_type": "INTEGER", "description": "Reference to customer dimension"},
    {"id": 9, "table_id": 3, "name": "order_date", "data_type": "DATE", "description": "Date when order was placed"},
]

# In-memory storage for releases
releases_cache: List[Dict] = [
    {"id": 1, "name": "R1.0", "description": "Initial release", "status": "Released"},
    {"id": 2, "name": "R1.1", "description": "Bug fixes", "status": "Released"},
    {"id": 3, "name": "R2.0", "description": "New features", "status": "In Progress"},
]

# In-memory storage for users
users_cache: List[Dict] = [
    {"id": 1, "username": "admin", "email": "admin@example.com", "password_hash": "hashed_password"},
    {"id": 2, "username": "user1", "email": "user1@example.com", "password_hash": "hashed_password"},
]

# Helper functions for mappings
def get_next_mapping_id() -> int:
    """Get the next available mapping ID."""
    global mapping_id_counter
    current_id = mapping_id_counter
    mapping_id_counter += 1
    return current_id

def add_mapping(mapping_data: Dict) -> Dict:
    """Add a new mapping to the cache."""
    mapping = mapping_data.copy()
    mapping["id"] = get_next_mapping_id()
    mapping["created_at"] = datetime.now().isoformat()
    mapping["updated_at"] = mapping["created_at"]
    mappings_cache.append(mapping)
    return mapping

def get_mapping(mapping_id: int) -> Optional[Dict]:
    """Get a mapping by ID."""
    for mapping in mappings_cache:
        if mapping["id"] == mapping_id:
            return mapping
    return None

def update_mapping(mapping_id: int, mapping_data: Dict) -> Optional[Dict]:
    """Update an existing mapping."""
    for i, mapping in enumerate(mappings_cache):
        if mapping["id"] == mapping_id:
            updated_mapping = {**mapping, **mapping_data}
            updated_mapping["updated_at"] = datetime.now().isoformat()
            mappings_cache[i] = updated_mapping
            return updated_mapping
    return None

def delete_mapping(mapping_id: int) -> bool:
    """Delete a mapping by ID."""
    for i, mapping in enumerate(mappings_cache):
        if mapping["id"] == mapping_id:
            del mappings_cache[i]
            return True
    return False

def get_all_mappings() -> List[Dict]:
    """Get all mappings."""
    return mappings_cache

# Initialize with some sample mappings
sample_mappings = [
    {
        "source_table_id": 1,
        "source_column_id": 1,
        "target_table_id": 1,
        "target_column_id": 1,
        "release_id": 1,
        "jira_ticket": "STTM-101",
        "status": "Released",
        "description": "Map customer ID to customer key",
    },
    {
        "source_table_id": 1,
        "source_column_id": 2,
        "target_table_id": 1,
        "target_column_id": 2,
        "release_id": 1,
        "jira_ticket": "STTM-102",
        "status": "Released",
        "description": "Map customer name to customer name",
    },
    {
        "source_table_id": 2,
        "source_column_id": 4,
        "target_table_id": 2,
        "target_column_id": 4,
        "release_id": 2,
        "jira_ticket": "STTM-201",
        "status": "Released",
        "description": "Map product ID to product key",
    },
    {
        "source_table_id": 3,
        "source_column_id": 8,
        "target_table_id": 3,
        "target_column_id": 8,
        "release_id": 3,
        "jira_ticket": "STTM-301",
        "status": "Draft",
        "description": "Map order customer ID to customer key",
    },
]

# Add sample mappings to cache
for mapping in sample_mappings:
    add_mapping(mapping) 