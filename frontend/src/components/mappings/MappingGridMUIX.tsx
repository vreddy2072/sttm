'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DataGrid, 
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridRowId,
  GridColDef,
  GridRenderCellParams,
  GridCellModes,
  GridCellModesModel,
  GridRowModel,
  GridRowEditStopReasons,
  GridEventListener,
  GridToolbarProps,
  GridCsvExportOptions,
  GridToolbarQuickFilterProps
} from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  Stack, 
  Snackbar, 
  Alert, 
  Typography, 
  InputBase,
  Paper,
  Tooltip,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GridCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { 
  Save as SaveIcon, 
  Add as AddIcon, 
  ContentCopy as ContentCopyIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { EnrichedMapping } from '@/lib/api';

interface CustomToolbarPropsExtended extends GridToolbarProps {
  selectedRows: GridRowId[];
  onAddMapping: () => void;
  onSaveAllChanges: () => void;
  onDeleteSelected: () => void;
  onCopySelected: () => void;
}

// Custom component for toolbar
const CustomToolbar = ({
  selectedRows,
  onAddMapping,
  onSaveAllChanges,
  onDeleteSelected,
  onCopySelected,
  ...props
}: CustomToolbarPropsExtended) => {
  const hasSelected = selectedRows.length > 0;

  return (
    <GridToolbarContainer {...props}>
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1, alignItems: 'center' }}>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddMapping}
          size="small"
        >
          Add Mapping
        </Button>
        <Button
          color="primary"
          startIcon={<SaveIcon />}
          onClick={onSaveAllChanges}
          size="small"
        >
          Save Changes
        </Button>
        <Button
          color="secondary"
          startIcon={<ContentCopyIcon />}
          onClick={onCopySelected}
          disabled={!hasSelected}
          size="small"
        >
          Copy {hasSelected ? `(${selectedRows.length})` : ''}
        </Button>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDeleteSelected}
          disabled={!hasSelected}
          size="small"
        >
          Delete {hasSelected ? `(${selectedRows.length})` : ''}
        </Button>
        <Tooltip title="Use keyboard shortcuts: Ctrl+C to copy, Ctrl+V to paste, Delete to remove selected">
          <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
            Pro tip: Keyboard shortcuts available
          </Typography>
        </Tooltip>
      </Stack>
      <QuickSearchToolbar {...props} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport 
        csvOptions={{ 
          fileName: 'data-mappings-export',
          delimiter: ',',
          includeHeaders: true
        } as GridCsvExportOptions} 
      />
    </GridToolbarContainer>
  );
};

// Custom search toolbar component
const QuickSearchToolbar = (props: GridToolbarQuickFilterProps) => {
  return (
    <Box
      sx={{
        p: 0.5,
        pb: 0,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: 300,
          border: '1px solid #e0e0e0',
          boxShadow: 'none'
        }}
      >
        <SearchIcon sx={{ p: '5px', color: 'action.active' }} />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search in all columns..."
          inputProps={{ 'aria-label': 'search data grid' }}
          value={props.value || ''}
          onChange={(event) => props.onChange(event.target.value)}
        />
      </Paper>
    </Box>
  );
};

// Status options
const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'IMPLEMENTED', label: 'Implemented' },
];

// Excel-like styling
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  '& .MuiDataGrid-cell--editing': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    padding: '0 !important'
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)', 
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiDataGrid-row.selected-row': {
    backgroundColor: 'rgba(25, 118, 210, 0.12)',
  },
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: '#f5f5f5',
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
  '& .status-cell-draft': {
    color: theme.palette.warning.main,
  },
  '& .status-cell-review': {
    color: theme.palette.info.main,
  },
  '& .status-cell-approved': {
    color: theme.palette.success.main, 
  },
  '& .status-cell-rejected': {
    color: theme.palette.error.main,
  },
  '& .status-cell-implemented': {
    color: theme.palette.success.dark,
  },
  // Excel-like grid lines
  '& .MuiDataGrid-columnSeparator': {
    visibility: 'visible',
    color: theme.palette.divider,
  },
  '& .MuiDataGrid-cell': {
    borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  // Clipboard indicator
  '& .MuiDataGrid-cell.clipboard-source': {
    border: `2px dashed ${theme.palette.primary.main}`,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  '& .MuiDataGrid-cell.drag-over': {
    backgroundColor: 'rgba(25, 118, 210, 0.2)',
  },
}));

interface MappingGridMUIXProps {
  mappings: EnrichedMapping[];
  isLoading: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
  onSave?: (mapping: EnrichedMapping) => void;
}

export default function MappingGridMUIX({
  mappings,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onSave,
}: MappingGridMUIXProps) {
  // State for rows (data)
  const [rows, setRows] = useState<EnrichedMapping[]>([]);
  
  // State for clipboard and cell modes
  const [editedRows, setEditedRows] = useState<Record<string, GridRowModel>>({});
  const [clipboardCell, setClipboardCell] = useState<{ field: string; value: any } | null>(null);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<{ id: GridRowId; field: string } | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
  
  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Update rows when mappings change
  useEffect(() => {
    if (mappings) {
      setRows(mappings);
    }
  }, [mappings]);

  // Handle keyboard shortcuts for clipboard operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Copy: Ctrl+C
      if (e.ctrlKey && e.key === 'c' && selectedRows.length > 0) {
        const selectedRow = rows.find(row => row.id === selectedRows[0]);
        if (selectedRow) {
          const activeElement = document.activeElement as HTMLElement;
          const field = activeElement?.getAttribute('data-field');
          if (field && selectedRow[field as keyof EnrichedMapping] !== undefined) {
            setClipboardCell({
              field: field,
              value: selectedRow[field as keyof EnrichedMapping]
            });
            showSnackbar('Copied to clipboard', 'info');
          }
        }
      }
      
      // Paste: Ctrl+V
      if (e.ctrlKey && e.key === 'v' && clipboardCell && selectedRows.length > 0) {
        const newEditedRows = { ...editedRows };
        
        selectedRows.forEach(rowId => {
          if (!newEditedRows[rowId.toString()]) {
            newEditedRows[rowId.toString()] = {};
          }
          newEditedRows[rowId.toString()][clipboardCell.field] = clipboardCell.value;
        });
        
        setEditedRows(newEditedRows);
        showSnackbar('Pasted from clipboard', 'info');
      }
      
      // Delete: Delete key
      if (e.key === 'Delete' && selectedRows.length > 0 && document.activeElement?.tagName !== 'INPUT') {
        const activeElement = document.activeElement as HTMLElement;
        const field = activeElement?.getAttribute('data-field');
        
        if (field) {
          const newEditedRows = { ...editedRows };
          
          selectedRows.forEach(rowId => {
            if (!newEditedRows[rowId.toString()]) {
              newEditedRows[rowId.toString()] = {};
            }
            newEditedRows[rowId.toString()][field] = '';
          });
          
          setEditedRows(newEditedRows);
          showSnackbar('Value cleared', 'info');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRows, rows, editedRows, clipboardCell]);

  // Define columns
  const columns = useMemo<GridColDef[]>(
    () => [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 90,
        editable: false
      },
      {
        field: 'source_table_name',
        headerName: 'Source Table',
        width: 180,
        editable: true,
      },
      {
        field: 'source_column_name',
        headerName: 'Source Column',
        width: 180,
        editable: true,
      },
      {
        field: 'target_table_name',
        headerName: 'Target Table',
        width: 180,
        editable: true,
      },
      {
        field: 'target_column_name',
        headerName: 'Target Column',
        width: 180,
        editable: true,
      },
      {
        field: 'release_name',
        headerName: 'Release',
        width: 150,
        editable: true,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        editable: true,
        type: 'singleSelect',
        valueOptions: STATUS_OPTIONS.map(option => option.value),
        renderCell: (params: GridRenderCellParams) => {
          const status = params.value as string;
          const statusClass = `status-cell-${status.toLowerCase()}`;
          return (
            <Chip 
              label={status} 
              size="small" 
              className={statusClass}
              sx={{ 
                fontWeight: 'bold', 
                minWidth: '90px',
                backgroundColor: status === 'DRAFT' ? '#fff9c4' :
                  status === 'REVIEW' ? '#bbdefb' :
                  status === 'APPROVED' ? '#c8e6c9' :
                  status === 'REJECTED' ? '#ffcdd2' :
                  status === 'IMPLEMENTED' ? '#a5d6a7' : 'default'
              }}
            />
          );
        },
      },
      {
        field: 'jira_ticket',
        headerName: 'JIRA Ticket',
        width: 150,
        editable: true,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => onEdit && onEdit(params.row as EnrichedMapping)}
                aria-label="edit"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete && onDelete(params.row as EnrichedMapping)}
                aria-label="delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [onDelete, onEdit]
  );

  // Event handlers
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleCellEditStop: GridEventListener<'cellEditStop'> = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleCellModesModelChange = (newModel: GridCellModesModel) => {
    setCellModesModel(newModel);
  };

  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const updatedRow = { ...newRow };
      
      // Store the edited row
      setEditedRows((prev) => ({
        ...prev,
        [newRow.id.toString()]: {
          ...(prev[newRow.id.toString()] || {}),
          ...updatedRow,
        },
      }));
      
      return updatedRow;
    },
    []
  );

  const handleSaveAllChanges = useCallback(() => {
    // Process all edited rows and save changes
    Object.entries(editedRows).forEach(([rowId, rowData]) => {
      const originalRow = rows.find((row) => row.id.toString() === rowId);
      if (originalRow) {
        const updatedMapping = {
          ...originalRow,
          ...rowData,
        } as EnrichedMapping;
        
        if (onSave) {
          onSave(updatedMapping);
        }
      }
    });
    
    // Clear edited rows after saving
    setEditedRows({});
    showSnackbar('All changes saved successfully', 'success');
  }, [editedRows, rows, onSave]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.length > 0 && window.confirm(`Are you sure you want to delete ${selectedRows.length} selected mapping(s)?`)) {
      selectedRows.forEach((rowId) => {
        const mappingToDelete = rows.find((row) => row.id === rowId);
        if (mappingToDelete && onDelete) {
          onDelete(mappingToDelete);
        }
      });
      setSelectedRows([]);
    }
  }, [selectedRows, rows, onDelete]);

  const handleCopySelected = useCallback(() => {
    if (selectedRows.length === 0) return;
    
    // Get the first selected row as template
    const sourceRow = rows.find(row => row.id === selectedRows[0]);
    if (!sourceRow) return;
    
    // Mark this row visually as source
    const sourceRowElement = document.querySelector(`[data-id="${sourceRow.id}"]`);
    if (sourceRowElement) {
      sourceRowElement.classList.add('clipboard-source');
      setTimeout(() => {
        sourceRowElement.classList.remove('clipboard-source');
      }, 2000);
    }
    
    // Collect fields that can be copied (exclude id and actions)
    const copyableFields = columns
      .filter(col => col.field !== 'id' && col.field !== 'actions')
      .map(col => col.field);
    
    // Create a template from the source row
    const template: Record<string, any> = {};
    copyableFields.forEach(field => {
      template[field] = sourceRow[field as keyof EnrichedMapping];
    });
    
    // Apply to other selected rows
    const newEditedRows = { ...editedRows };
    
    selectedRows.slice(1).forEach(rowId => {
      if (!newEditedRows[rowId.toString()]) {
        newEditedRows[rowId.toString()] = {};
      }
      
      // Copy all fields from template
      Object.entries(template).forEach(([field, value]) => {
        newEditedRows[rowId.toString()][field] = value;
      });
    });
    
    setEditedRows(newEditedRows);
    showSnackbar(`Copied values to ${selectedRows.length - 1} rows`, 'success');
  }, [selectedRows, rows, columns, editedRows]);

  // Mouse event handlers for fill handle drag operation
  const handleCellMouseDown = useCallback(
    (params: GridCellParams) => {
      if (params.field === 'actions') return;
      
      setDragStartCell({
        id: params.id,
        field: params.field,
      });
    },
    []
  );

  const handleCellMouseUp = useCallback(() => {
    if (isDragging && dragStartCell) {
      setIsDragging(false);
      
      // Remove drag-over class from all cells
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });
      
      showSnackbar('Filled cells with values', 'success');
    }
    
    setDragStartCell(null);
  }, [isDragging, dragStartCell]);

  const handleCellMouseEnter = useCallback(
    (params: GridCellParams) => {
      if (!dragStartCell || params.field !== dragStartCell.field) return;
      
      setIsDragging(true);
      
      // Apply drag-over visual effect
      const cellElement = document.querySelector(
        `[data-id="${params.id}"][data-field="${params.field}"]`
      );
      if (cellElement) {
        cellElement.classList.add('drag-over');
      }
      
      // Get value from drag start cell
      const sourceRow = rows.find(row => row.id === dragStartCell.id);
      if (!sourceRow) return;
      
      // Update the current cell with the value from drag start cell
      const value = sourceRow[dragStartCell.field as keyof EnrichedMapping];
      
      const newEditedRows = { ...editedRows };
      if (!newEditedRows[params.id.toString()]) {
        newEditedRows[params.id.toString()] = {};
      }
      
      newEditedRows[params.id.toString()][params.field] = value;
      setEditedRows(newEditedRows);
    },
    [dragStartCell, rows, editedRows]
  );

  const handleCellMouseLeave = useCallback(
    (params: GridCellParams) => {
      if (!isDragging) return;
      
      // Remove drag-over effect when mouse leaves the cell
      const cellElement = document.querySelector(
        `[data-id="${params.id}"][data-field="${params.field}"]`
      );
      if (cellElement) {
        cellElement.classList.remove('drag-over');
      }
    },
    [isDragging]
  );

  // Helper functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Process rows with edited values for display
  const processedRows = rows.map(row => {
    const editedRow = editedRows[row.id.toString()];
    return editedRow ? { ...row, ...editedRow } : row;
  });

  return (
    <Box sx={{ height: 650, width: '100%' }}>
      <Paper
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          boxShadow: 3,
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
      >
        <StyledDataGrid
          rows={processedRows}
          columns={columns}
          editMode="cell"
          loading={isLoading}
          rowHeight={52}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
          rowSelectionModel={selectedRows}
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onRowEditStop={handleRowEditStop}
          onCellEditStop={handleCellEditStop}
          processRowUpdate={processRowUpdate}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseUp={handleCellMouseUp}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseLeave={handleCellMouseLeave}
          getRowClassName={(params) => 
            selectedRows.includes(params.id) ? 'selected-row' : ''
          }
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: {
              selectedRows,
              onAddMapping: onAdd || (() => {}),
              onSaveAllChanges: handleSaveAllChanges,
              onDeleteSelected: handleDeleteSelected,
              onCopySelected: handleCopySelected,
            } as any,
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: {
              sortModel: [{ field: 'id', sort: 'asc' }],
            },
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          density="standard"
          sx={{
            '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
            '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
            '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' },
          }}
        />
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 