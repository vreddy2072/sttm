'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReleases, useCreateRelease, useUpdateRelease, useDeleteRelease } from '@/lib/hooks';
import { Release } from '@/lib/api';

interface ReleaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; status: string; description?: string }) => void;
  release?: Release;
  isLoading?: boolean;
}

function ReleaseForm({ open, onClose, onSubmit, release, isLoading = false }: ReleaseFormProps) {
  const [name, setName] = useState(release?.name || '');
  const [status, setStatus] = useState(release?.status || 'Planned');
  const [description, setDescription] = useState(release?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, status, description });
    if (!release) {
      setName('');
      setStatus('Planned');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{release ? 'Edit Release' : 'Create New Release'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Release Name"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
              disabled={isLoading}
            >
              <MenuItem value="Planned">Planned</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Testing">Testing</MenuItem>
              <MenuItem value="Released">Released</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading || !name}>
            {release ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function ReleaseManager() {
  // State for form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | undefined>(undefined);
  
  // Fetch data
  const { data: releases = [], isLoading, error } = useReleases();
  
  // Mutations
  const createReleaseMutation = useCreateRelease();
  const updateReleaseMutation = useUpdateRelease();
  const deleteReleaseMutation = useDeleteRelease();
  
  const isCreating = createReleaseMutation.isPending;
  const isUpdating = updateReleaseMutation.isPending;
  const isDeleting = deleteReleaseMutation.isPending;
  
  // Event handlers
  const handleOpenForm = (release?: Release) => {
    setSelectedRelease(release);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedRelease(undefined);
  };
  
  const handleSubmitForm = (data: { name: string; status: string; description?: string }) => {
    if (selectedRelease) {
      updateReleaseMutation.mutate(
        { id: selectedRelease.id, ...data },
        {
          onSuccess: () => {
            handleCloseForm();
          },
        }
      );
    } else {
      createReleaseMutation.mutate(data, {
        onSuccess: () => {
          handleCloseForm();
        },
      });
    }
  };
  
  const handleDeleteRelease = (id: number) => {
    if (confirm('Are you sure you want to delete this release?')) {
      deleteReleaseMutation.mutate(id);
    }
  };
  
  // Loading and error states
  const isFormLoading = isCreating || isUpdating;
  const isTableLoading = isLoading || isDeleting;
  
  if (error) {
    return <Alert severity="error">Error loading releases: {error.message}</Alert>;
  }
  
  // Helper function to get color for status chip
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'Testing':
        return 'info';
      case 'Released':
        return 'success';
      case 'Archived':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Release Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          New Release
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isTableLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : releases && releases.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {releases.map((release) => (
                  <TableRow key={release.id}>
                    <TableCell>{release.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={release.status}
                        color={getStatusColor(release.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{release.description}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(release)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRelease(release.id)}
                        aria-label="delete"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No releases found. Create your first release to get started.
            </Typography>
          </Box>
        )}
      </Paper>
      
      <ReleaseForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        release={selectedRelease}
        isLoading={isFormLoading}
      />
    </Box>
  );
} 