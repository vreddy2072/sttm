'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  IconButton,
  Button,
  Tooltip,
  TablePagination,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  styled,
} from '@mui/material';
import { Edit, Trash2, Filter, Download, Plus, Check, X, Save } from 'lucide-react';
import { EnrichedMapping } from '@/lib/api';

// Excel-like styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  position: 'relative',
  padding: '8px',
  border: `1px solid ${theme.palette.divider}`,
  '&.selected': {
    backgroundColor: 'rgba(0, 120, 215, 0.1)',
    outline: '2px solid #0078d4',
  },
  '&.editing': {
    padding: '0',
  },
  '&.in-range': {
    backgroundColor: 'rgba(0, 120, 215, 0.05)',
  },
}));

const StyledInput = styled('input')(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: '8px',
  border: 'none',
  background: 'white',
  outline: '2px solid #0078d4',
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  '&:focus': {
    outline: '2px solid #0078d4',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  height: '100%',
  '& .MuiSelect-select': {
    padding: '8px',
  },
  '& fieldset': {
    border: 'none',
  },
}));

interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

interface Selection {
  start: CellPosition;
  end: CellPosition;
}

interface MappingGridProps {
  mappings: EnrichedMapping[];
  isLoading: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
  onSave?: (mapping: EnrichedMapping) => void;
}

interface CellEditorProps {
  value: any;
  row: any;
  column: any;
  onSave: (value: any) => void;
  onCancel: () => void;
}

const CellEditor = ({ value, row, column, onSave, onCancel }: CellEditorProps) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (column.accessorKey === 'status') {
    return (
      <StyledSelect
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(editValue)}
        autoFocus
      >
        {statusOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </StyledSelect>
    );
  }

  return (
    <StyledInput
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(editValue)}
    />
  );
};

export default function MappingGrid({
  mappings,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onSave,
}: MappingGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<EnrichedMapping>>({});
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Status options for dropdown
  const statusOptions = ['Draft', 'In Progress', 'In Review', 'Released', 'Deprecated'];

  const handleEditClick = (mappingId: number) => {
    const mappingToEdit = mappings.find(m => m.id === mappingId);
    if (mappingToEdit) {
      setEditingRow(mappingId);
      setEditedValues({ ...mappingToEdit });
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedValues({});
  };

  const handleSaveEdit = (mappingId: number) => {
    if (onSave && editedValues) {
      // Ensure the id is included
      const updatedMapping = { 
        ...editedValues, 
        id: mappingId 
      } as EnrichedMapping;
      
      onSave(updatedMapping);
      setEditingRow(null);
      setEditedValues({});
    }
  };

  const handleFieldChange = (field: keyof EnrichedMapping, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDoubleClick = (rowIndex: number, colIndex: number) => {
    const column = columns[colIndex];
    if (column.accessorKey && column.accessorKey !== 'id' && column.accessorKey !== 'actions') {
      setEditingCell({ rowIndex, colIndex });
    }
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, value: any) => {
    const row = table.getRowModel().rows[rowIndex];
    const column = columns[colIndex];
    const field = column.accessorKey as keyof EnrichedMapping;
    
    if (field && field !== 'id' && field !== 'actions') {
      handleFieldChange(field, value);
      setEditingCell(null);
    }
  };

  const columns = useMemo<ColumnDef<EnrichedMapping>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
        cell: ({ row }) => {
          const id = row.getValue('id') as number;
          return <Typography>{id}</Typography>;
        },
      },
      {
        accessorKey: 'source_table_name',
        header: 'Source Table',
        cell: ({ row, column, getValue }) => {
          const value = getValue() as string;
          const rowIndex = table.getRowModel().rows.indexOf(row);
          const colIndex = columns.findIndex(col => col.accessorKey === column.accessorKey);
          
          if (editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex) {
            return (
              <CellEditor
                value={value}
                row={row}
                column={column}
                onSave={(newValue) => handleCellEdit(rowIndex, colIndex, newValue)}
                onCancel={() => setEditingCell(null)}
              />
            );
          }
          
          return <Typography>{value}</Typography>;
        },
      },
      {
        accessorKey: 'source_column_name',
        header: 'Source Column',
        cell: ({ row }) => {
          const id = row.original.id;
          const value = row.getValue('source_column_name') as string;
          
          return editingRow === id ? (
            <TextField
              size="small"
              fullWidth
              value={editedValues.source_column_name || value}
              onChange={(e) => handleFieldChange('source_column_name', e.target.value)}
              variant="outlined"
            />
          ) : (
            <Typography>{value}</Typography>
          );
        },
      },
      {
        accessorKey: 'target_table_name',
        header: 'Target Table',
        cell: ({ row }) => {
          const id = row.original.id;
          const value = row.getValue('target_table_name') as string;
          
          return editingRow === id ? (
            <TextField
              size="small"
              fullWidth
              value={editedValues.target_table_name || value}
              onChange={(e) => handleFieldChange('target_table_name', e.target.value)}
              variant="outlined"
            />
          ) : (
            <Typography>{value}</Typography>
          );
        },
      },
      {
        accessorKey: 'target_column_name',
        header: 'Target Column',
        cell: ({ row }) => {
          const id = row.original.id;
          const value = row.getValue('target_column_name') as string;
          
          return editingRow === id ? (
            <TextField
              size="small"
              fullWidth
              value={editedValues.target_column_name || value}
              onChange={(e) => handleFieldChange('target_column_name', e.target.value)}
              variant="outlined"
            />
          ) : (
            <Typography>{value}</Typography>
          );
        },
      },
      {
        accessorKey: 'release_name',
        header: 'Release',
        cell: ({ row }) => {
          const id = row.original.id;
          const value = row.getValue('release_name') as string;
          
          return editingRow === id ? (
            <TextField
              size="small"
              fullWidth
              value={editedValues.release_name || value}
              onChange={(e) => handleFieldChange('release_name', e.target.value)}
              variant="outlined"
            />
          ) : (
            <Typography>{value}</Typography>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const id = row.original.id;
          const status = row.getValue('status') as string;
          let color = 'default';
          
          if (status === 'Released') {
            color = 'success.main';
          } else if (status === 'Draft') {
            color = 'warning.main';
          }
          
          return editingRow === id ? (
            <FormControl fullWidth size="small">
              <Select
                value={editedValues.status || status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                variant="outlined"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ color }}>{status}</Typography>
          );
        },
      },
      {
        accessorKey: 'jira_ticket',
        header: 'JIRA Ticket',
        cell: ({ row }) => {
          const id = row.original.id;
          const value = row.getValue('jira_ticket') as string;
          
          return editingRow === id ? (
            <TextField
              size="small"
              fullWidth
              value={editedValues.jira_ticket || value}
              onChange={(e) => handleFieldChange('jira_ticket', e.target.value)}
              variant="outlined"
            />
          ) : (
            <Typography>{value}</Typography>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const id = row.original.id as number;
          
          if (editingRow === id) {
            return (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Save">
                  <IconButton
                    size="small"
                    onClick={() => handleSaveEdit(id)}
                    aria-label="save"
                    color="success"
                  >
                    <Save size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    aria-label="cancel"
                  >
                    <X size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onEdit && (
                <Tooltip title="Edit in Form">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(row.original)}
                    aria-label="edit in form"
                  >
                    <Edit size={18} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Edit in Grid">
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(id)}
                  aria-label="edit in grid"
                  color="primary"
                >
                  <Check size={18} />
                </IconButton>
              </Tooltip>
              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(row.original)}
                    aria-label="delete"
                    color="error"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        },
      },
    ],
    [editingRow, editedValues, onEdit, onDelete, statusOptions]
  );

  const table = useReactTable({
    data: mappings,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) setIsShiftPressed(true);

      if (!selectedCell) return;

      const { rowIndex, colIndex } = selectedCell;
      const totalRows = table.getRowModel().rows.length;
      const totalCols = columns.length;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (rowIndex > 0) {
            moveSelection(rowIndex - 1, colIndex);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (rowIndex < totalRows - 1) {
            moveSelection(rowIndex + 1, colIndex);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (colIndex > 0) {
            moveSelection(rowIndex, colIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (colIndex < totalCols - 1) {
            moveSelection(rowIndex, colIndex + 1);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (editingCell) {
            // Handle in CellEditor component
            return;
          }
          if (e.ctrlKey || e.metaKey) {
            handleDoubleClick(rowIndex, colIndex);
          } else {
            moveSelection(rowIndex + 1, colIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (editingRow !== null) {
            handleCancelEdit();
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleCopy();
          }
          break;
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlePaste();
          }
          break;
        case 'F2':
          e.preventDefault();
          const column = columns[colIndex];
          if (column.accessorKey && column.accessorKey !== 'id' && column.accessorKey !== 'actions') {
            setEditingCell(selectedCell);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (colIndex > 0) {
              moveSelection(rowIndex, colIndex - 1);
            } else if (rowIndex > 0) {
              moveSelection(rowIndex - 1, columns.length - 1);
            }
          } else {
            if (colIndex < totalCols - 1) {
              moveSelection(rowIndex, colIndex + 1);
            } else if (rowIndex < totalRows - 1) {
              moveSelection(rowIndex + 1, 0);
            }
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey) setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedCell, editingRow, isShiftPressed, editingCell]);

  const moveSelection = (rowIndex: number, colIndex: number) => {
    if (isShiftPressed && selectedCell) {
      setSelection({
        start: selectedCell,
        end: { rowIndex, colIndex },
      });
    } else {
      setSelectedCell({ rowIndex, colIndex });
      setSelection(null);
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (isShiftPressed && selectedCell) {
      setSelection({
        start: selectedCell,
        end: { rowIndex, colIndex },
      });
    } else {
      setSelectedCell({ rowIndex, colIndex });
      setSelection(null);
    }
  };

  const isCellSelected = (rowIndex: number, colIndex: number) => {
    if (selection) {
      const minRow = Math.min(selection.start.rowIndex, selection.end.rowIndex);
      const maxRow = Math.max(selection.start.rowIndex, selection.end.rowIndex);
      const minCol = Math.min(selection.start.colIndex, selection.end.colIndex);
      const maxCol = Math.max(selection.start.colIndex, selection.end.colIndex);

      return (
        rowIndex >= minRow &&
        rowIndex <= maxRow &&
        colIndex >= minCol &&
        colIndex <= maxCol
      );
    }

    return selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex;
  };

  const handleCopy = () => {
    if (!selection && !selectedCell) return;

    let copyText = '';
    const rows = table.getRowModel().rows;

    if (selection) {
      const minRow = Math.min(selection.start.rowIndex, selection.end.rowIndex);
      const maxRow = Math.max(selection.start.rowIndex, selection.end.rowIndex);
      const minCol = Math.min(selection.start.colIndex, selection.end.colIndex);
      const maxCol = Math.max(selection.start.colIndex, selection.end.colIndex);

      for (let i = minRow; i <= maxRow; i++) {
        const rowData = [];
        for (let j = minCol; j <= maxCol; j++) {
          const cell = rows[i].getVisibleCells()[j];
          rowData.push(cell.getValue());
        }
        copyText += rowData.join('\t') + '\n';
      }
    } else if (selectedCell) {
      const cell = rows[selectedCell.rowIndex].getVisibleCells()[selectedCell.colIndex];
      copyText = String(cell.getValue());
    }

    navigator.clipboard.writeText(copyText);
  };

  const handlePaste = async () => {
    if (!selectedCell || editingRow !== null) return;

    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split('\n');
      const currentRowIndex = selectedCell.rowIndex;
      const currentColIndex = selectedCell.colIndex;

      rows.forEach((row, rowOffset) => {
        if (!row) return;
        const values = row.split('\t');
        values.forEach((value, colOffset) => {
          const targetRowIndex = currentRowIndex + rowOffset;
          const targetColIndex = currentColIndex + colOffset;

          if (
            targetRowIndex < table.getRowModel().rows.length &&
            targetColIndex < columns.length
          ) {
            const targetRow = table.getRowModel().rows[targetRowIndex];
            const field = columns[targetColIndex].accessorKey as keyof EnrichedMapping;
            if (field && field !== 'id' && field !== 'actions') {
              handleFieldChange(field, value);
            }
          }
        });
      });
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Source-to-Target Mappings</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            InputProps={{
              startAdornment: <Filter size={18} />,
            }}
          />
          <Tooltip title="Export to Excel">
            <IconButton color="primary">
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
        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader ref={tableRef}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <StyledTableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        backgroundColor: header.column.getCanSort()
                          ? 'rgba(0, 0, 0, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: editingRow === row.original.id ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                  }}
                >
                  {row.getVisibleCells().map((cell, colIndex) => (
                    <StyledTableCell
                      key={cell.id}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
                      className={`
                        ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''}
                        ${editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex ? 'editing' : ''}
                      `}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </StyledTableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No mappings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
      />
    </Paper>
  );
} 