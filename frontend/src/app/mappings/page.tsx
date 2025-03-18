'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '@/components/layout/MainLayout';
import MappingGridAG from '@/components/mappings/MappingGridAG';
import MappingForm from '@/components/mappings/MappingForm';
import { 
  useMappings, 
  useCreateMapping, 
  useUpdateMapping, 
  useDeleteMapping,
  useReleases
} from '@/lib/hooks';
import { Mapping, EnrichedMapping } from '@/lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mapping-tabpanel-${index}`}
      aria-labelledby={`mapping-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MappingsPage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  
  // State for tab management
  const [tabValue, setTabValue] = useState(viewParam === 'releases' ? 1 : 0);
  
  // State for form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<Mapping | undefined>(undefined);
  
  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Fetch data
  const { data: mappings, isLoading: isLoadingMappings, error: mappingsError } = useMappings();
  const { data: releases, isLoading: isLoadingReleases, error: releasesError } = useReleases();
  
  // Mutations
  const createMappingMutation = useCreateMapping();
  const updateMappingMutation = useUpdateMapping();
  const deleteMappingMutation = useDeleteMapping();
  
  const isCreating = createMappingMutation.isPending;
  const isUpdating = updateMappingMutation.isPending;
  const isDeleting = deleteMappingMutation.isPending;
  
  // Event handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenForm = (mapping?: Mapping) => {
    setSelectedMapping(mapping);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedMapping(undefined);
  };
  
  const handleSubmitForm = (data: any) => {
    if (selectedMapping) {
      updateMappingMutation.mutate(
        { id: selectedMapping.id, mapping: data },
        {
          onSuccess: () => {
            setFormOpen(false);
            setSelectedMapping(undefined);
            setNotification({
              open: true,
              message: 'Mapping updated successfully',
              severity: 'success',
            });
          },
          onError: (error) => {
            setNotification({
              open: true,
              message: `Error updating mapping: ${error.message}`,
              severity: 'error',
            });
          },
        }
      );
    } else {
      createMappingMutation.mutate(
        data,
        {
          onSuccess: () => {
            setFormOpen(false);
            setNotification({
              open: true,
              message: 'Mapping created successfully',
              severity: 'success',
            });
          },
          onError: (error) => {
            setNotification({
              open: true,
              message: `Error creating mapping: ${error.message}`,
              severity: 'error',
            });
          },
        }
      );
    }
  };
  
  const handleInPlaceEdit = (updatedMapping: EnrichedMapping) => {
    updateMappingMutation.mutate(
      { 
        id: updatedMapping.id, 
        mapping: {
          source_table_id: updatedMapping.source_table_id,
          source_column_id: updatedMapping.source_column_id,
          target_table_id: updatedMapping.target_table_id,
          target_column_id: updatedMapping.target_column_id,
          release_id: updatedMapping.release_id,
          status: updatedMapping.status,
          jira_ticket: updatedMapping.jira_ticket,
          description: updatedMapping.description
        }
      },
      {
        onSuccess: () => {
          setNotification({
            open: true,
            message: 'Mapping updated successfully',
            severity: 'success',
          });
        },
        onError: (error) => {
          setNotification({
            open: true,
            message: `Error updating mapping: ${error.message}`,
            severity: 'error',
          });
        },
      }
    );
  };
  
  const handleDeleteMapping = (mapping: EnrichedMapping) => {
    if (confirm('Are you sure you want to delete this mapping?')) {
      deleteMappingMutation.mutate(
        mapping.id,
        {
          onSuccess: () => {
            setNotification({
              open: true,
              message: 'Mapping deleted successfully',
              severity: 'success',
            });
          },
          onError: (error) => {
            setNotification({
              open: true,
              message: `Error deleting mapping: ${error.message}`,
              severity: 'error',
            });
          },
        }
      );
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Loading and error states
  const isLoading = isLoadingMappings || isLoadingReleases;
  const error = mappingsError || releasesError;
  
  if (error) {
    return (
      <MainLayout>
        <Alert severity="error">
          Error loading data: {error.message}
        </Alert>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Source-to-Target Mappings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            New Mapping
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="mapping tabs">
              <Tab label="All Mappings" id="mapping-tab-0" aria-controls="mapping-tabpanel-0" />
              <Tab label="By Release" id="mapping-tab-1" aria-controls="mapping-tabpanel-1" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <MappingGridAG
                mappings={mappings || []}
                isLoading={isLoading}
                onEdit={handleOpenForm}
                onDelete={handleDeleteMapping}
                onAdd={() => handleOpenForm()}
                onSave={handleInPlaceEdit}
              />
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {releases?.map((release) => {
                  const releaseMappings = mappings?.filter(
                    (m) => m.release_id === release.id
                  ) || [];
                  
                  return (
                    <Box key={release.id} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {release.name} ({release.status})
                      </Typography>
                      <MappingGridAG
                        mappings={releaseMappings}
                        isLoading={isLoading}
                        onEdit={handleOpenForm}
                        onDelete={handleDeleteMapping}
                        onAdd={() => handleOpenForm()}
                        onSave={handleInPlaceEdit}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Box>
      
      <MappingForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        mapping={selectedMapping}
        isLoading={isCreating || isUpdating}
      />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
} 