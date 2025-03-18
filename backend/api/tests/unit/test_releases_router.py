"""
Unit tests for the releases router.
"""
import pytest
from fastapi.testclient import TestClient
from backend.api.app import app

client = TestClient(app)

def test_get_releases():
    """Test getting releases."""
    response = client.get("/api/releases/")
    assert response.status_code == 200
    releases = response.json()
    assert isinstance(releases, list)
    assert len(releases) > 0
    
    # Check that each release has the expected fields
    for release in releases:
        assert "id" in release
        assert "name" in release
        assert "description" in release
        assert "status" in release 