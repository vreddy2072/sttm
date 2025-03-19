'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Typography,
  CircularProgress,
  InputBase,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { Edit, Trash2, Filter, Download, Plus, Save } from 'lucide-react';
import { EnrichedMapping } from '@/lib/api';
import { styled } from '@mui/material/styles';

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

interface MUIGridProps {
  mappings: EnrichedMapping[];
  isLoading: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
  onSave?: (mapping: EnrichedMapping) => void;
}

type SortDirection = 'asc' | 'desc';

export default function MUIGrid({
  mappings,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onSave,
}: MUIGridProps) {
  const [filterText, setFilterText] = useState('');
  const [orderBy, setOrderBy] = useState<keyof EnrichedMapping>('id');
  const [order, setOrder] = useState<SortDirection>('asc');
  const [editableRows, setEditableRows] = useState<Record<number, EnrichedMapping>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Status options for dropdown
  const statusOptions = ['Draft', 'In Progress', 'In Review', 'Released', 'Deprecated'];

  // Handle request sort
  const handleRequestSort = useCallback((property: keyof EnrichedMapping) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Handle cell edit
  const handleCellEdit = useCallback((id: number, field: keyof EnrichedMapping, value: any) => {
    setEditableRows(prev => {
      const updatedRow = { 
        ...prev[id] || mappings.find(m => m.id === id)!, 
        [field]: value 
      };
      
      return { ...prev, [id]: updatedRow };
    });
    
    setHasChanges(true);
  }, [mappings]);

  // Filter mappings
  const filteredMappings = useMemo(() => {
    return mappings.filter(mapping => {
      if (!filterText) return true;
      
      const searchText = filterText.toLowerCase();
      return (
        (mapping.source_table_name?.toString().toLowerCase().includes(searchText)) ||
        (mapping.source_column_name?.toString().toLowerCase().includes(searchText)) ||
        (mapping.target_table_name?.toString().toLowerCase().includes(searchText)) ||
        (mapping.target_column_name?.toString().toLowerCase().includes(searchText)) ||
        (mapping.release_name?.toString().toLowerCase().includes(searchText)) ||
        (mapping.status?.toString().toLowerCase().includes(searchText)) ||
        (mapping.jira_ticket?.toString().toLowerCase().includes(searchText))
      );
    });
  }, [mappings, filterText]);

  // Sort mappings
  const sortedMappings = useMemo(() => {
    const stabilizedThis = filteredMappings.map((el, index) => [el, index] as [EnrichedMapping, number]);
    
    stabilizedThis.sort((a, b) => {
      const aValue = a[0][orderBy];
      const bValue = b[0][orderBy];
      
      // Handle null/undefined values
      if (!aValue && bValue) return order === 'asc' ? -1 : 1;
      if (aValue && !bValue) return order === 'asc' ? 1 : -1;
      if (!aValue && !bValue) return 0;
      
      // Compare values
      const compared = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      
      return order === 'asc' ? compared : -compared;
    });
    
    return stabilizedThis.map(el => el[0]);
  }, [filteredMappings, order, orderBy]);

  // Handle filter change
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  }, []);

  // Handle save changes
  const handleSaveChanges = useCallback(() => {
    if (onSave && Object.keys(editableRows).length > 0) {
      Object.values(editableRows).forEach(mapping => {
        onSave(mapping);
      });
      
      setEditableRows({});
      setHasChanges(false);
    }
  }, [onSave, editableRows]);

  // Render cell content with optional editing
  const renderCell = useCallback((row: EnrichedMapping, field: keyof EnrichedMapping) => {
    // Get the value (either from edited state or original)
    const editedRow = editableRows[row.id];
    const value = editedRow ? editedRow[field] : row[field];
    
    // For editable fields, render input
    if (field !== 'id' && field !== 'actions') {
      // For status field, render select
      if (field === 'status') {
        return (
          <EditableCell>
            <FormControl fullWidth size="small">
              <Select
                value={value || ''}
                onChange={(e) => handleCellEdit(row.id, field, e.target.value)}
                variant="standard"
                displayEmpty
                sx={{ p: 0.5 }}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </EditableCell>
        );
      }
      
      // For other fields, render text input
      return (
        <EditableCell>
          <InputBase
            value={value || ''}
            onChange={(e) => handleCellEdit(row.id, field, e.target.value)}
            fullWidth
            sx={{ p: 0.5 }}
          />
        </EditableCell>
      );
    }
    
    // For non-editable fields, just return the value
    return value;
  }, [editableRows, handleCellEdit, statusOptions]);

  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(() => {
    try {
      // Get headers
      const headers = [
        'id', 
        'source_table_name', 
        'source_column_name', 
        'target_table_name', 
        'target_column_name',
        'release_name',
        'status',
        'jira_ticket'
      ];
      
      // Get data rows
      const rows = sortedMappings.map(row => {
        return headers.map(h => row[h as keyof EnrichedMapping]).join('\t');
      });
      
      // Combine headers and rows
      const data = [headers.join('\t'), ...rows].join('\n');
      
      // Copy to clipboard
      navigator.clipboard.writeText(data);
    } catch (e) {
      console.error("Error copying to clipboard:", e);
    }
  }, [sortedMappings]);

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
            value={filterText}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <Filter size={18} />,
            }}
          />
          <Tooltip title="Copy to Clipboard">
            <IconButton color="primary" onClick={handleCopyToClipboard}>
              <Download size={20} />
            </IconButton>
          </Tooltip>
          {onAdd && (
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={onAdd}>
              Add Mapping
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Save size={18} />}
            onClick={handleSaveChanges}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'source_table_name'}
                  direction={orderBy === 'source_table_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('source_table_name')}
                >
                  Source Table
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'source_column_name'}
                  direction={orderBy === 'source_column_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('source_column_name')}
                >
                  Source Column
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'target_table_name'}
                  direction={orderBy === 'target_table_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('target_table_name')}
                >
                  Target Table
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'target_column_name'}
                  direction={orderBy === 'target_column_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('target_column_name')}
                >
                  Target Column
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'release_name'}
                  direction={orderBy === 'release_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('release_name')}
                >
                  Release
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'jira_ticket'}
                  direction={orderBy === 'jira_ticket' ? order : 'asc'}
                  onClick={() => handleRequestSort('jira_ticket')}
                >
                  JIRA Ticket
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMappings.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{renderCell(row, 'source_table_name')}</TableCell>
                <TableCell>{renderCell(row, 'source_column_name')}</TableCell>
                <TableCell>{renderCell(row, 'target_table_name')}</TableCell>
                <TableCell>{renderCell(row, 'target_column_name')}</TableCell>
                <TableCell>{renderCell(row, 'release_name')}</TableCell>
                <TableCell>{renderCell(row, 'status')}</TableCell>
                <TableCell>{renderCell(row, 'jira_ticket')}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {onEdit && (
                      <Tooltip title="Edit in Form">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(row)}
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
                          onClick={() => onDelete(row)}
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
            ))}
            {sortedMappings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
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