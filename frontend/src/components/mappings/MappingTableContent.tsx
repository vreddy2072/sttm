'use client';

import { useCallback, useState, useEffect, useRef, KeyboardEvent, MouseEvent } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Select,
  MenuItem,
  InputBase,
  styled,
} from '@mui/material';
import { Edit, Trash2, Filter, Download, Plus, Save } from 'lucide-react';
import { EnrichedMapping } from '@/lib/api';

interface MappingTableContentProps {
  mappings: EnrichedMapping[];
  isLoading?: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
  onSave?: (mapping: EnrichedMapping) => void;
}

type SortDirection = 'asc' | 'desc';

interface HeadCell {
  id: keyof EnrichedMapping | 'actions';
  label: string;
  sortable: boolean;
  editable?: boolean;
  type?: 'text' | 'select';
  options?: string[];
}

// Styled component for editable cell
const EditableCell = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: theme.spacing(0.5),
  position: 'relative',
  '&:focus-within': {
    outline: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.action.focus,
  },
}));

// Styled component for fill handle
const FillHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 8,
  height: 8,
  backgroundColor: theme.palette.primary.main,
  cursor: 'crosshair',
  zIndex: 2,
}));

interface EditingCell {
  rowId: number;
  field: keyof EnrichedMapping;
}

interface DragState {
  active: boolean;
  startRowId: number;
  startField: keyof EnrichedMapping;
  value: string;
  currentRowId?: number;
  currentField?: keyof EnrichedMapping;
}

export default function MappingTableContent({
  mappings,
  onEdit,
  onDelete,
  onAdd,
  onSave,
}: MappingTableContentProps) {
  const [filterText, setFilterText] = useState('');
  const [orderBy, setOrderBy] = useState<keyof EnrichedMapping>('id');
  const [order, setOrder] = useState<SortDirection>('asc');
  const [selected, setSelected] = useState<number[]>([]);
  const [focusedCell, setFocusedCell] = useState<EditingCell | null>(null);
  const [localMappings, setLocalMappings] = useState<EnrichedMapping[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const cellRefs = useRef<Record<string, HTMLInputElement | HTMLElement | null>>({});

  // Update local mappings when prop mappings change
  useEffect(() => {
    setLocalMappings(mappings);
  }, [mappings]);

  // Setup mouse event listeners for drag operation
  useEffect(() => {
    if (dragState?.active) {
      const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (!tableRef.current || !dragState?.active) return;

        // Find the cell element under the cursor
        const cellElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        if (!cellElement) return;

        // Try to find the parent cell element that has a data-cell-id attribute
        let currentElement: HTMLElement | null = cellElement;
        let cellId: string | null = null;
        
        while (currentElement && !cellId) {
          cellId = currentElement.getAttribute('data-cell-id');
          if (!cellId) {
            currentElement = currentElement.parentElement;
          }
        }

        if (cellId) {
          const [_, rowIdStr, field] = cellId.split('-');
          const rowId = parseInt(rowIdStr, 10);
          
          // Update the drag state with current cell
          if (rowId !== dragState.currentRowId || field !== dragState.currentField) {
            setDragState({
              ...dragState,
              currentRowId: rowId,
              currentField: field as keyof EnrichedMapping,
            });
          }
        }
      };

      const handleMouseUp = () => {
        if (!dragState?.active) return;
        
        // Apply the drag operation to fill cells
        if (dragState.currentRowId && dragState.currentField) {
          const startRowIndex = localMappings.findIndex(m => m.id === dragState.startRowId);
          const endRowIndex = localMappings.findIndex(m => m.id === dragState.currentRowId);
          
          if (startRowIndex !== -1 && endRowIndex !== -1) {
            // Determine min and max indices for the range
            const minRowIndex = Math.min(startRowIndex, endRowIndex);
            const maxRowIndex = Math.max(startRowIndex, endRowIndex);
            
            // Only fill if we're actually dragging across cells
            if (minRowIndex !== maxRowIndex) {
              const updatedMappings = [...localMappings];
              
              // Fill all cells in the range with the value
              for (let i = minRowIndex; i <= maxRowIndex; i++) {
                if (i !== startRowIndex) { // Skip the source cell
                  const mappingId = updatedMappings[i].id;
                  updatedMappings[i] = {
                    ...updatedMappings[i],
                    [dragState.startField]: dragState.value
                  };
                }
              }
              
              setLocalMappings(updatedMappings);
              setHasChanges(true);
            }
          }
        }
        
        // Reset the drag state
        setDragState(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, localMappings]);

  // Status options for dropdown
  const statusOptions = ['Draft', 'In Progress', 'In Review', 'Released', 'Deprecated'];

  const headCells: HeadCell[] = [
    { id: 'id', label: 'ID', sortable: true, editable: false },
    { id: 'source_table_name', label: 'Source Table', sortable: true, editable: true, type: 'text' },
    { id: 'source_column_name', label: 'Source Column', sortable: true, editable: true, type: 'text' },
    { id: 'target_table_name', label: 'Target Table', sortable: true, editable: true, type: 'text' },
    { id: 'target_column_name', label: 'Target Column', sortable: true, editable: true, type: 'text' },
    { id: 'release_name', label: 'Release', sortable: true, editable: true, type: 'text' },
    { id: 'status', label: 'Status', sortable: true, editable: true, type: 'select', options: statusOptions },
    { id: 'jira_ticket', label: 'JIRA Ticket', sortable: true, editable: true, type: 'text' },
    { id: 'actions', label: 'Actions', sortable: false, editable: false },
  ];

  const handleRequestSort = (property: keyof EnrichedMapping) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = localMappings.map(n => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent, id: number) => {
    // If we're dragging, don't change selection
    if (dragState?.active) return;

    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  // Function to handle copy to clipboard
  const handleCopyToClipboard = () => {
    if (!selected.length) return;

    const selectedRows = localMappings.filter(m => selected.includes(m.id));
    const data = selectedRows.map(row => {
      return Object.values(row).join('\t');
    }).join('\n');

    navigator.clipboard.writeText(data);
  };

  // Function to handle cell focus
  const handleCellFocus = (rowId: number, field: keyof EnrichedMapping) => {
    setFocusedCell({ rowId, field });
  };

  // Function to handle cell value changes
  const handleCellChange = (
    rowId: number, 
    field: keyof EnrichedMapping, 
    value: string
  ) => {
    // Update the mapping in local state
    const updatedMappings = localMappings.map(mapping => {
      if (mapping.id === rowId) {
        return { ...mapping, [field]: value };
      }
      return mapping;
    });
    
    setLocalMappings(updatedMappings);
    setHasChanges(true);
  };

  // Function to handle fill handle mouse down
  const handleFillHandleMouseDown = (
    e: React.MouseEvent,
    rowId: number,
    field: keyof EnrichedMapping,
    value: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Start drag operation
    setDragState({
      active: true,
      startRowId: rowId,
      startField: field,
      value: value,
    });
  };

  // Function to save all changes
  const saveAllChanges = () => {
    if (!hasChanges || !onSave) return;
    
    // For simplicity, let's save each changed mapping
    // In a real app, you might want to batch these
    localMappings.forEach(mapping => {
      const originalMapping = mappings.find(m => m.id === mapping.id);
      if (originalMapping && JSON.stringify(mapping) !== JSON.stringify(originalMapping)) {
        onSave(mapping);
      }
    });
    
    setHasChanges(false);
  };

  // Function to handle keyboard navigation
  const handleKeyDown = (
    e: KeyboardEvent<HTMLDivElement | HTMLInputElement>, 
    rowId: number, 
    field: keyof EnrichedMapping
  ) => {
    const handleNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
      e.preventDefault();
      
      // Find current indices
      const rowIndex = localMappings.findIndex(m => m.id === rowId);
      const colIndex = headCells.findIndex(c => c.id === field);
      
      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex;
      
      // Calculate next indices based on direction
      switch (direction) {
        case 'up':
          nextRowIndex = Math.max(0, rowIndex - 1);
          break;
        case 'down':
          nextRowIndex = Math.min(localMappings.length - 1, rowIndex + 1);
          break;
        case 'left':
          // Find previous editable column
          do {
            nextColIndex = (nextColIndex - 1) % headCells.length;
            if (nextColIndex < 0) nextColIndex = headCells.length - 1;
          } while (!headCells[nextColIndex].editable && nextColIndex !== colIndex);
          break;
        case 'right':
          // Find next editable column
          do {
            nextColIndex = (nextColIndex + 1) % headCells.length;
          } while (!headCells[nextColIndex].editable && nextColIndex !== colIndex);
          break;
      }
      
      // If we found a valid next cell, focus it
      if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
        const nextRow = localMappings[nextRowIndex];
        const nextField = headCells[nextColIndex].id as keyof EnrichedMapping;
        
        if (nextRow && nextField) {
          // Focus the cell
          const cellId = `cell-${nextRow.id}-${nextField}`;
          setTimeout(() => {
            const element = cellRefs.current[cellId];
            if (element) {
              if ('focus' in element) {
                element.focus();
              } else if (element instanceof HTMLElement) {
                element.focus();
              }
            }
          }, 0);
        }
      }
    };
    
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        handleNavigation(e.shiftKey ? 'left' : 'right');
        break;
      case 'ArrowUp':
        handleNavigation('up');
        break;
      case 'ArrowDown':
        handleNavigation('down');
        break;
      case 'ArrowLeft':
        // Only navigate left if at beginning of text input
        if (e.currentTarget instanceof HTMLInputElement && 
            e.currentTarget.selectionStart === 0 &&
            e.currentTarget.selectionEnd === 0) {
          handleNavigation('left');
        }
        break;
      case 'ArrowRight':
        // Only navigate right if at end of text input
        if (e.currentTarget instanceof HTMLInputElement && 
            e.currentTarget.selectionStart === e.currentTarget.value.length &&
            e.currentTarget.selectionEnd === e.currentTarget.value.length) {
          handleNavigation('right');
        }
        break;
      case 'Enter':
        handleNavigation('down');
        break;
    }
  };

  // Render an editable cell
  const renderEditableCell = (row: EnrichedMapping, field: keyof EnrichedMapping) => {
    const cellDef = headCells.find(cell => cell.id === field);
    const cellId = `cell-${row.id}-${field}`;
    const isFocused = focusedCell?.rowId === row.id && focusedCell?.field === field;
    const value = row[field] || '';
    
    if (!cellDef?.editable) {
      return String(value);
    }

    return (
      <EditableCell data-cell-id={cellId}>
        {cellDef.type === 'select' && cellDef.options ? (
          <Select
            value={value}
            onChange={(e) => handleCellChange(row.id, field, e.target.value as string)}
            fullWidth
            variant="standard"
            onFocus={() => handleCellFocus(row.id, field)}
            onKeyDown={(e) => handleKeyDown(e, row.id, field)}
            inputRef={(el) => { cellRefs.current[cellId] = el; }}
            sx={{ 
              border: 'none',
              '&:before': { border: 'none' },
              '&:after': { border: 'none' },
              '& .MuiSelect-select': { p: 0.5 }
            }}
          >
            {cellDef.options.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <InputBase
            value={value}
            onChange={(e) => handleCellChange(row.id, field, e.target.value)}
            fullWidth
            inputRef={(el) => { cellRefs.current[cellId] = el; }}
            onFocus={() => handleCellFocus(row.id, field)}
            onKeyDown={(e) => handleKeyDown(e, row.id, field)}
            sx={{ p: 0.5 }}
          />
        )}
        {isFocused && (
          <FillHandle 
            onMouseDown={(e) => handleFillHandleMouseDown(e, row.id, field, String(value))}
          />
        )}
      </EditableCell>
    );
  };

  const filteredMappings = localMappings.filter(mapping => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    
    return (
      (mapping.source_table_name?.toLowerCase().includes(searchText)) ||
      (mapping.source_column_name?.toLowerCase().includes(searchText)) ||
      (mapping.target_table_name?.toLowerCase().includes(searchText)) ||
      (mapping.target_column_name?.toLowerCase().includes(searchText)) ||
      (mapping.release_name?.toLowerCase().includes(searchText)) ||
      (mapping.status?.toLowerCase().includes(searchText)) ||
      (mapping.jira_ticket?.toLowerCase().includes(searchText))
    );
  });

  // Sort function
  const sortedMappings = [...filteredMappings].sort((a, b) => {
    const valueA = a[orderBy] || '';
    const valueB = b[orderBy] || '';
    
    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        position: 'relative',
        cursor: dragState?.active ? 'crosshair' : 'auto',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Source-to-Target Mappings</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={filterText}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <Filter size={18} />,
            }}
          />
          <Tooltip title="Copy Selected">
            <IconButton 
              color="primary" 
              onClick={handleCopyToClipboard}
              disabled={selected.length === 0}
            >
              <Download size={20} />
            </IconButton>
          </Tooltip>
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={onAdd}
            >
              Add Mapping
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Save size={18} />}
            onClick={saveAllChanges}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table" ref={tableRef}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < localMappings.length}
                  checked={localMappings.length > 0 && selected.length === localMappings.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all mappings' }}
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id as keyof EnrichedMapping)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMappings.map((row) => {
              const isItemSelected = isSelected(row.id);

              return (
                <TableRow
                  hover
                  onClick={(event) => handleClick(event, row.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id}
                  selected={isItemSelected}
                  sx={{
                    // Highlight the row when active in a drag operation
                    ...(dragState?.active && dragState.currentRowId === row.id && {
                      backgroundColor: 'action.hover',
                    }),
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${row.id}` }}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{renderEditableCell(row, 'source_table_name')}</TableCell>
                  <TableCell>{renderEditableCell(row, 'source_column_name')}</TableCell>
                  <TableCell>{renderEditableCell(row, 'target_table_name')}</TableCell>
                  <TableCell>{renderEditableCell(row, 'target_column_name')}</TableCell>
                  <TableCell>{renderEditableCell(row, 'release_name')}</TableCell>
                  <TableCell>{renderEditableCell(row, 'status')}</TableCell>
                  <TableCell>{renderEditableCell(row, 'jira_ticket')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {onEdit && (
                        <Tooltip title="Edit in Form">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            aria-label="edit in form"
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            aria-label="delete"
                            color="error"
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedMappings.length === 0 && (
              <TableRow>
                <TableCell colSpan={headCells.length + 1} align="center">
                  No mappings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 