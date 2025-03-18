"""
Main FastAPI application for the STTM application.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application
app = FastAPI(
    title="Source-to-Target Mapping API",
    description="API for managing source-to-target mappings",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from backend.api.routers import mappings, tables, columns, releases

app.include_router(mappings.router, prefix="/api/mappings", tags=["mappings"])
app.include_router(tables.router, prefix="/api/tables", tags=["tables"])
app.include_router(columns.router, prefix="/api/columns", tags=["columns"])
app.include_router(releases.router, prefix="/api/releases", tags=["releases"])

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to the STTM API"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"} 