'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Mapping, MappingCreate, MappingUpdate } from '@/lib/api';
import { useSourceTables, useTargetTables, useSourceColumns, useTargetColumns, useReleases } from '@/lib/hooks';

// Form validation schema
const mappingSchema = z.object({
  source_table_id: z.number().min(1, 'Source table is required'),
  source_column_id: z.number().min(1, 'Source column is required'),
  target_table_id: z.number().min(1, 'Target table is required'),
  target_column_id: z.number().min(1, 'Target column is required'),
  release_id: z.number().optional(),
  jira_ticket: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
});

type MappingFormData = z.infer<typeof mappingSchema>;

interface MappingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MappingCreate | MappingUpdate) => void;
  mapping?: Mapping;
  isLoading?: boolean;
}

export default function MappingForm({
  open,
  onClose,
  onSubmit,
  mapping,
  isLoading = false,
}: MappingFormProps) {
  // Get data from API
  const { data: sourceTables, isLoading: isLoadingSourceTables } = useSourceTables();
  const { data: targetTables, isLoading: isLoadingTargetTables } = useTargetTables();
  const { data: releases, isLoading: isLoadingReleases } = useReleases();
  
  // State for selected tables to filter columns
  const [selectedSourceTableId, setSelectedSourceTableId] = useState<number | undefined>(
    mapping?.source_table_id
  );
  const [selectedTargetTableId, setSelectedTargetTableId] = useState<number | undefined>(
    mapping?.target_table_id
  );
  
  // Get columns based on selected tables
  const { data: sourceColumns, isLoading: isLoadingSourceColumns } = useSourceColumns(
    selectedSourceTableId
  );
  const { data: targetColumns, isLoading: isLoadingTargetColumns } = useTargetColumns(
    selectedTargetTableId
  );
  
  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MappingFormData>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      source_table_id: mapping?.source_table_id || 0,
      source_column_id: mapping?.source_column_id || 0,
      target_table_id: mapping?.target_table_id || 0,
      target_column_id: mapping?.target_column_id || 0,
      release_id: mapping?.release_id || undefined,
      jira_ticket: mapping?.jira_ticket || '',
      status: mapping?.status || 'Draft',
      description: mapping?.description || '',
    },
  });
  
  // Watch for table changes to update columns
  const watchSourceTableId = watch('source_table_id');
  const watchTargetTableId = watch('target_table_id');
  
  useEffect(() => {
    if (watchSourceTableId !== selectedSourceTableId) {
      setSelectedSourceTableId(watchSourceTableId);
      setValue('source_column_id', 0);
    }
  }, [watchSourceTableId, selectedSourceTableId, setValue]);
  
  useEffect(() => {
    if (watchTargetTableId !== selectedTargetTableId) {
      setSelectedTargetTableId(watchTargetTableId);
      setValue('target_column_id', 0);
    }
  }, [watchTargetTableId, selectedTargetTableId, setValue]);
  
  // Reset form when mapping changes
  useEffect(() => {
    if (mapping) {
      reset({
        source_table_id: mapping.source_table_id,
        source_column_id: mapping.source_column_id,
        target_table_id: mapping.target_table_id,
        target_column_id: mapping.target_column_id,
        release_id: mapping.release_id,
        jira_ticket: mapping.jira_ticket || '',
        status: mapping.status,
        description: mapping.description || '',
      });
      setSelectedSourceTableId(mapping.source_table_id);
      setSelectedTargetTableId(mapping.target_table_id);
    } else {
      reset({
        source_table_id: 0,
        source_column_id: 0,
        target_table_id: 0,
        target_column_id: 0,
        release_id: undefined,
        jira_ticket: '',
        status: 'Draft',
        description: '',
      });
      setSelectedSourceTableId(undefined);
      setSelectedTargetTableId(undefined);
    }
  }, [mapping, reset]);
  
  const onFormSubmit = (data: MappingFormData) => {
    onSubmit(data);
  };
  
  const isFormLoading =
    isLoading ||
    isLoadingSourceTables ||
    isLoadingTargetTables ||
    isLoadingSourceColumns ||
    isLoadingTargetColumns ||
    isLoadingReleases;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mapping ? 'Edit Mapping' : 'Create New Mapping'}</DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="source_table_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.source_table_id} margin="normal">
                    <InputLabel>Source Table</InputLabel>
                    <Select
                      {...field}
                      value={field.value || 0}
                      label="Source Table"
                      disabled={isFormLoading}
                    >
                      <MenuItem value={0} disabled>
                        Select a source table
                      </MenuItem>
                      {sourceTables?.map((table) => (
                        <MenuItem key={table.id} value={table.id}>
                          {table.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.source_table_id && (
                      <FormHelperText>{errors.source_table_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="source_column_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.source_column_id} margin="normal">
                    <InputLabel>Source Column</InputLabel>
                    <Select
                      {...field}
                      value={field.value || 0}
                      label="Source Column"
                      disabled={isFormLoading || !selectedSourceTableId}
                    >
                      <MenuItem value={0} disabled>
                        Select a source column
                      </MenuItem>
                      {sourceColumns
                        ?.filter((col) => col.table_id === selectedSourceTableId)
                        .map((column) => (
                          <MenuItem key={column.id} value={column.id}>
                            {column.name} ({column.data_type})
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.source_column_id && (
                      <FormHelperText>{errors.source_column_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="target_table_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.target_table_id} margin="normal">
                    <InputLabel>Target Table</InputLabel>
                    <Select
                      {...field}
                      value={field.value || 0}
                      label="Target Table"
                      disabled={isFormLoading}
                    >
                      <MenuItem value={0} disabled>
                        Select a target table
                      </MenuItem>
                      {targetTables?.map((table) => (
                        <MenuItem key={table.id} value={table.id}>
                          {table.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.target_table_id && (
                      <FormHelperText>{errors.target_table_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="target_column_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.target_column_id} margin="normal">
                    <InputLabel>Target Column</InputLabel>
                    <Select
                      {...field}
                      value={field.value || 0}
                      label="Target Column"
                      disabled={isFormLoading || !selectedTargetTableId}
                    >
                      <MenuItem value={0} disabled>
                        Select a target column
                      </MenuItem>
                      {targetColumns
                        ?.filter((col) => col.table_id === selectedTargetTableId)
                        .map((column) => (
                          <MenuItem key={column.id} value={column.id}>
                            {column.name} ({column.data_type})
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.target_column_id && (
                      <FormHelperText>{errors.target_column_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="release_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Release</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="Release"
                      disabled={isFormLoading}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {releases?.map((release) => (
                        <MenuItem key={release.id} value={release.id}>
                          {release.name} ({release.status})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status" disabled={isFormLoading}>
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Review">Review</MenuItem>
                      <MenuItem value="Released">Released</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="jira_ticket"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="JIRA Ticket"
                    fullWidth
                    margin="normal"
                    disabled={isFormLoading}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    disabled={isFormLoading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isFormLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isFormLoading}
            startIcon={isFormLoading ? <CircularProgress size={20} /> : null}
          >
            {mapping ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 