/**
 * Custom hooks for the STTM application.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Mapping, MappingCreate, MappingUpdate, EnrichedMapping, Table, Column, Release } from './api';

// Mappings hooks
export function useMappings(releaseId?: number, status?: string) {
  return useQuery({
    queryKey: ['mappings', { releaseId, status }],
    queryFn: () => api.getMappings(releaseId, status),
  });
}

export function useEnrichedMappings() {
  return useQuery({
    queryKey: ['mappings', 'enriched'],
    queryFn: () => api.getEnrichedMappings(),
  });
}

export function useMapping(id: number) {
  return useQuery({
    queryKey: ['mapping', id],
    queryFn: () => api.getMapping(id),
    enabled: !!id,
  });
}

export function useCreateMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mapping: MappingCreate) => api.createMapping(mapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
}

export function useUpdateMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, mapping }: { id: number; mapping: MappingUpdate }) => api.updateMapping(id, mapping),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      queryClient.invalidateQueries({ queryKey: ['mapping', variables.id] });
    },
  });
}

export function useDeleteMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
}

// Tables hooks
export function useSourceTables() {
  return useQuery({
    queryKey: ['tables', 'source'],
    queryFn: () => api.getSourceTables(),
  });
}

export function useTargetTables() {
  return useQuery({
    queryKey: ['tables', 'target'],
    queryFn: () => api.getTargetTables(),
  });
}

// Mock implementation for table creation hooks (not actually used)
export function useCreateSourceTable() {
  return {
    mutate: () => {
      console.warn('Creating source tables is not supported - tables are read-only from the transaction database');
    },
    isPending: false,
  };
}

export function useCreateTargetTable() {
  return {
    mutate: () => {
      console.warn('Creating target tables is not supported - tables are read-only from the transaction database');
    },
    isPending: false,
  };
}

// Columns hooks
export function useSourceColumns(tableId?: number) {
  return useQuery({
    queryKey: ['columns', 'source', tableId],
    queryFn: () => api.getSourceColumns(tableId),
    enabled: tableId === undefined || !!tableId,
  });
}

export function useTargetColumns(tableId?: number) {
  return useQuery({
    queryKey: ['columns', 'target', tableId],
    queryFn: () => api.getTargetColumns(tableId),
    enabled: tableId === undefined || !!tableId,
  });
}

// Mock implementation for column creation hooks (not actually used)
export function useCreateSourceColumn() {
  return {
    mutate: () => {
      console.warn('Creating source columns is not supported - columns are read-only from the transaction database');
    },
    isPending: false,
  };
}

export function useCreateTargetColumn() {
  return {
    mutate: () => {
      console.warn('Creating target columns is not supported - columns are read-only from the transaction database');
    },
    isPending: false,
  };
}

// Releases hooks
export function useReleases() {
  return useQuery({
    queryKey: ['releases'],
    queryFn: () => api.getReleases(),
  });
}

// Mock implementation for release management hooks
export function useCreateRelease() {
  const queryClient = useQueryClient();
  
  return useMutation<
    Release, 
    Error, 
    { name: string; status: string; description?: string }
  >({
    mutationFn: (releaseData) => {
      // Mock implementation that returns a fake successful response
      return Promise.resolve({
        id: Math.floor(Math.random() * 1000),
        name: releaseData.name,
        status: releaseData.status,
        description: releaseData.description || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });
}

export function useUpdateRelease() {
  const queryClient = useQueryClient();
  
  return useMutation<
    Release, 
    Error, 
    { id: number; name: string; status: string; description?: string }
  >({
    mutationFn: (releaseData) => {
      // Mock implementation that returns a fake successful response
      return Promise.resolve({
        id: releaseData.id,
        name: releaseData.name,
        status: releaseData.status,
        description: releaseData.description || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });
}

export function useDeleteRelease() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => {
      // Mock implementation that returns a fake successful response
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });
} 