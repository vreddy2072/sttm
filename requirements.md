# MVP Prompt for Building a Source-to-Target Mapping (STTM) Application

## Project Overview
Create a web-based application to replace Excel-based STTM documents. The application will track mappings between source tables/columns and target tables/columns, with workflow approvals and integration capabilities.

## Core MVP Features

### 1. Data Management
- **Database alignment**: Store source/target table and column definitions aligned with actual database structure
- **Mapping relationships**: Track relationships between source and target elements
- **Release tagging**: Ability to tag mappings with release numbers
- **JIRA integration**: Link mappings to JIRA user stories

### 2. User Interface
- **Grid view**: Excel-like interface for viewing and editing mappings
- **Excel-like interactions**: Support dragging to copy data across cells and ranges (key Excel functionality)
- **Inline editing**: Add/update entries directly in the grid
- **Bulk operations**: Upload multiple mappings at once
- **Filtering**: Filter by all columns, especially release numbers
- **Status management**: Change pre-release items to released status

### 3. Workflow & Approvals
- **Basic approval workflow**: Submit changes for review and approval
- **Change tracking**: Track who made what changes and when
- **Versioning**: Maintain history of mapping changes

### 4. Integration Points
- **Template generation**: Export STTMs that align with Enterprise Templates
- **GetData upload capability**: Interface for uploading to GetData external application
- **Collibra alignment**: Ensure STTM information aligns with Collibra

### 5. Additional Requirements
- **Table load rules**: Storage for table loading rules
- **Expire/delete functionality**: Ability to mark entries as expired or delete them
- **Template standardization**: Consistent STTM templates across teams

## Technical Requirements

### Frontend
- **Framework**: Next.js with React and TypeScript
- **UI Component Library**: Material-UI for structured components
- **Styling**: Tailwind CSS for flexible custom styling
- **Icons**: lucide-react for consistent, lightweight SVG icons
- **Data Grid**: TanStack Table (formerly React Table) with custom drag functionality
- **State Management**: React Query for server state + Context API for UI state
- **Form Handling**: React Hook Form with Zod for validation

### Backend
- **Language**: Python based app
- **Server**: FastAPI for high-performance Python-based API development
- **Architecture**: Implement a layered architecture:
  - Server layer (FastAPI endpoints)
  - Service layer (business logic)
  - ORM layer (SQLAlchemy)
  - Database layer (Oracle)
- **Data transfer**: Use Pydantic models for schema validation and data transfer between layers
- **Database**: Oracle database for enterprise integration and performance
- **Authentication**: Basic role-based authentication
- **API**: RESTful endpoints for CRUD operations

### Integration
- **File handling**: Excel import/export functionality
- **API connectors**: Simple connectors for JIRA, Collibra, and GetData

## Development Approach
1. Set up Next.js project with TypeScript, Material-UI, and Tailwind CSS
2. Implement TanStack Table with custom Excel-like drag functionality
3. Create FastAPI backend with layered architecture
4. Implement core CRUD operations for mappings
5. Add authentication and user management
6. Implement approval workflow
7. Add integration points with external systems
8. Implement release tagging and filtering capabilities

## Implementation Priority
1. Database design with Oracle and SQLAlchemy ORM setup
2. FastAPI structure with layered architecture and Pydantic models
3. Grid view with TanStack Table, including custom Excel-like interactions
4. Import/export functionality
5. User authentication and roles
6. Basic approval workflow
7. Release tagging and JIRA integration

## Technical Implementation Notes

### FastAPI Backend Implementation
```python
# Example of FastAPI layered architecture

# Server Layer (API endpoints)
@router.get("/mappings/", response_model=List[MappingSchema])
async def get_mappings(db: Session = Depends(get_db)):
    return mapping_service.get_all_mappings(db)

@router.post("/mappings/", response_model=MappingSchema)
async def create_mapping(mapping: MappingSchema, db: Session = Depends(get_db)):
    return mapping_service.create_mapping(db, mapping)

# Service Layer (Business logic)
def get_all_mappings(db: Session):
    return mapping_repository.get_all(db)

def create_mapping(db: Session, mapping_data: MappingSchema):
    mapping = MappingModel(**mapping_data.dict())
    return mapping_repository.create(db, mapping)

# Repository/ORM Layer
def get_all(db: Session):
    return db.query(MappingModel).all()

def create(db: Session, mapping: MappingModel):
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping

# Pydantic Models for data transfer
class MappingSchema(BaseModel):
    id: Optional[int] = None
    source_table: str
    source_column: str
    target_table: str
    target_column: str
    release_number: Optional[str]
    jira_ticket: Optional[str]
    status: Optional[str] = "Draft"
    
    class Config:
        orm_mode = True
```

### Frontend Grid Implementation with TanStack Table
```tsx
// Example implementation with TanStack Table and custom drag functionality
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  ColumnDef, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table';
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { CopyCheck, Filter, Upload, Save } from 'lucide-react';

// TypeScript interface for mapping data
interface Mapping {
  id?: number;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  releaseNumber?: string;
  jiraTicket?: string;
  status?: string;
}

export const MappingGrid = ({ data, onDataChange }) => {
  const [rowData, setRowData] = useState<Mapping[]>(data);
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnId: string} | null>(null);
  const [cellValues, setCellValues] = useState<{[key: string]: any}>({});
  
  // Drag-to-copy functionality state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<{rowIndex: number, columnId: string} | null>(null);
  const [dragEndCell, setDragEndCell] = useState<{rowIndex: number, columnId: string} | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<{rowIndex: number, columnId: string}[]>([]);
  
  // Create columns definition
  const columns: ColumnDef<Mapping>[] = [
    { accessorKey: 'sourceTable', header: 'Source Table' },
    { accessorKey: 'sourceColumn', header: 'Source Column' },
    { accessorKey: 'targetTable', header: 'Target Table' },
    { accessorKey: 'targetColumn', header: 'Target Column' },
    { accessorKey: 'releaseNumber', header: 'Release' },
    { accessorKey: 'jiraTicket', header: 'JIRA Ticket' },
    { accessorKey: 'status', header: 'Status' },
  ];
  
  // Initialize TanStack Table
  const table = useReactTable({
    data: rowData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  // Handle cell editing
  const startEditing = (rowIndex: number, columnId: string) => {
    const rowData = table.getRowModel().rows[rowIndex].original;
    setCellValues({
      ...cellValues,
      [`${rowIndex}-${columnId}`]: rowData[columnId as keyof Mapping] || '',
    });
    setEditingCell({ rowIndex, columnId });
  };
  
  const stopEditing = () => {
    if (editingCell) {
      const { rowIndex, columnId } = editingCell;
      const newValue = cellValues[`${rowIndex}-${columnId}`];
      const newData = [...rowData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnId]: newValue,
      };
      setRowData(newData);
      onDataChange(newData);
      setEditingCell(null);
    }
  };
  
  // Handle cell value changes
  const handleCellValueChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, columnId: string) => {
    setCellValues({
      ...cellValues,
      [`${rowIndex}-${columnId}`]: e.target.value,
    });
  };
  
  // Drag-to-copy functionality
  const handleMouseDown = (e: React.MouseEvent, rowIndex: number, columnId: string) => {
    if (e.button === 0) { // Left click only
      setDragStartCell({ rowIndex, columnId });
      setIsDragging(true);
      // Start selection
      setIsSelecting(true);
      setSelectedCells([{ rowIndex, columnId }]);
      
      // Prevent text selection
      e.preventDefault();
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSelecting(false);
    
    // If drag operation is complete, apply the fill
    if (dragStartCell && dragEndCell) {
      applyDragFill(dragStartCell, dragEndCell);
    }
    
    setDragStartCell(null);
    setDragEndCell(null);
  };
  
  const handleMouseEnter = (rowIndex: number, columnId: string) => {
    if (isDragging && dragStartCell) {
      setDragEndCell({ rowIndex, columnId });
      
      // Update selection
      if (isSelecting) {
        // Calculate the range of cells between start and current
        const startRow = Math.min(dragStartCell.rowIndex, rowIndex);
        const endRow = Math.max(dragStartCell.rowIndex, rowIndex);
        const startCol = columns.findIndex(col => col.accessorKey === dragStartCell.columnId);
        const endCol = columns.findIndex(col => col.accessorKey === columnId);
        
        const newSelectedCells = [];
        for (let i = startRow; i <= endRow; i++) {
          for (let j = Math.min(startCol, endCol); j <= Math.max(startCol, endCol); j++) {
            newSelectedCells.push({ 
              rowIndex: i, 
              columnId: columns[j].accessorKey as string 
            });
          }
        }
        setSelectedCells(newSelectedCells);
      }
    }
  };
  
  // Apply drag fill to copy values
  const applyDragFill = (startCell: {rowIndex: number, columnId: string}, endCell: {rowIndex: number, columnId: string}) => {
    const newData = [...rowData];
    const sourceValue = newData[startCell.rowIndex][startCell.columnId as keyof Mapping];
    
    // Determine the range
    const startRow = Math.min(startCell.rowIndex, endCell.rowIndex);
    const endRow = Math.max(startCell.rowIndex, endCell.rowIndex);
    const startCol = columns.findIndex(col => col.accessorKey === startCell.columnId);
    const endCol = columns.findIndex(col => col.accessorKey === endCell.columnId);
    
    // Fill values
    for (let i = startRow; i <= endRow; i++) {
      for (let j = Math.min(startCol, endCol); j <= Math.max(startCol, endCol); j++) {
        const colId = columns[j].accessorKey as string;
        newData[i] = {
          ...newData[i],
          [colId]: sourceValue,
        };
      }
    }
    
    setRowData(newData);
    onDataChange(newData);
    setSelectedCells([]);
  };
  
  // Check if a cell is selected
  const isCellSelected = (rowIndex: number, columnId: string) => {
    return selectedCells.some(cell => 
      cell.rowIndex === rowIndex && cell.columnId === columnId
    );
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCell) {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          stopEditing();
          
          // Move to next cell
          if (e.key === 'Tab') {
            const { rowIndex, columnId } = editingCell;
            const colIndex = columns.findIndex(col => col.accessorKey === columnId);
            const nextColIndex = e.shiftKey ? colIndex - 1 : colIndex + 1;
            
            if (nextColIndex >= 0 && nextColIndex < columns.length) {
              startEditing(rowIndex, columns[nextColIndex].accessorKey as string);
            } else if (!e.shiftKey && rowIndex < rowData.length - 1) {
              startEditing(rowIndex + 1, columns[0].accessorKey as string);
            } else if (e.shiftKey && rowIndex > 0) {
              startEditing(rowIndex - 1, columns[columns.length - 1].accessorKey as string);
            }
          }
        } else if (e.key === 'Escape') {
          setEditingCell(null);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, cellValues, columns, rowData.length]);
  
  return (
    <Paper elevation={2} className="w-full">
      <Box className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Source to Target Mappings</Typography>
          <div className="flex gap-2">
            <Button startIcon={<Filter className="w-4 h-4" />} variant="outlined" size="small">
              Filter
            </Button>
            <Button startIcon={<Upload className="w-4 h-4" />} variant="outlined" size="small">
              Import
            </Button>
            <Button startIcon={<Save className="w-4 h-4" />} variant="contained" size="small">
              Save
            </Button>
          </div>
        </div>
        
        <TableContainer style={{ height: '600px' }}>
          <Table stickyHeader className="min-w-full">
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} className="font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows