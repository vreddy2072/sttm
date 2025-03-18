'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  CircularProgress,
} from '@mui/material';
import { EnrichedMapping } from '@/lib/api';

// Import the actual grid component dynamically to prevent SSR
const MappingTableContent = dynamic(
  () => import('./MappingTableContent'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
);

interface MappingGridProps {
  mappings: EnrichedMapping[];
  isLoading: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
  onSave?: (mapping: EnrichedMapping) => void;
}

export default function MappingGridAG(props: MappingGridProps) {
  if (props.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <MappingTableContent {...props} />;
} 