'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit, Trash2, Download, Filter, Plus, Save } from 'lucide-react';
import { EnrichedMapping } from '@/lib/api';
import dynamic from 'next/dynamic';

// Import the AG Grid modules setup file
import '@/lib/ag-grid-modules';

// Import types for TypeScript
import type { 
  ColDef,
  GridReadyEvent,
  CellEditingStoppedEvent,
  GridApi,
  ColumnApi,
} from 'ag-grid-community';

// Dynamically import MUI Grid as a fallback
const MUIGrid = dynamic(() => import('@/components/mappings/MUI-Grid'), { 
  ssr: false,
  loading: () => <CircularProgress />
});

// Force using the fallback initially to avoid AG Grid initialization issues
// We'll try AG Grid version in a future update once this is stable
const USE_FALLBACK = true;

interface MappingGridCommunityProps {
  mappings: EnrichedMapping[];
  isLoading: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
  onSave?: (mapping: EnrichedMapping) => void;
}

export default function MappingGridCommunity({
  mappings,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onSave,
}: MappingGridCommunityProps) {
  const [filterText, setFilterText] = useState('');
  const [editedRows, setEditedRows] = useState<Record<number, EnrichedMapping>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [gridError, setGridError] = useState<Error | null>(null);

  // Status options for dropdown
  const statusOptions = ['Draft', 'In Progress', 'In Review', 'Released', 'Deprecated'];

  // Filter mappings based on text input
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

  // Handle filter text change
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  }, []);

  // Handle saving changes
  const handleSaveChanges = useCallback(() => {
    if (onSave && Object.keys(editedRows).length > 0) {
      // Save each edited row
      Object.values(editedRows).forEach(mapping => {
        onSave(mapping);
      });
      setEditedRows({});
      setHasChanges(false);
    }
  }, [onSave, editedRows]);

  // Handle cell edit
  const handleCellEdit = useCallback((id: number, field: keyof EnrichedMapping, value: any) => {
    setEditedRows(prev => {
      const updatedRow = { 
        ...prev[id] || mappings.find(m => m.id === id)!, 
        [field]: value 
      };
      
      return { ...prev, [id]: updatedRow };
    });
    
    setHasChanges(true);
  }, [mappings]);

  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(() => {
    try {
      // Fallback copy method
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
      
      const rows = filteredMappings.map(row => {
        return headers.map(h => row[h as keyof EnrichedMapping]).join('\t');
      });
      
      const data = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(data);
    } catch (e) {
      console.error("Error copying to clipboard:", e);
      setGridError(e as Error);
    }
  }, [filteredMappings]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Always use MUI Grid for now until we resolve all AG Grid issues
  return (
    <Box>
      {gridError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using simplified grid due to compatibility issues.
        </Alert>
      )}
      <MUIGrid 
        mappings={mappings}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
        onSave={onSave}
      />
    </Box>
  );
} 