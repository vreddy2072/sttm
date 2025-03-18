'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '@/components/layout/MainLayout';
import { 
  useSourceTables, 
  useTargetTables, 
  useSourceColumns, 
  useTargetColumns,
  useCreateSourceTable,
  useCreateTargetTable,
  useCreateSourceColumn,
  useCreateTargetColumn
} from '@/lib/hooks';
import { Table as TableType, Column } from '@/lib/api';

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
      id={`table-tabpanel-${index}`}
      aria-labelledby={`table-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Table Form Component
interface TableFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
  isSource: boolean;
  isLoading?: boolean;
}

function TableForm({ open, onClose, onSubmit, isSource, isLoading = false }: TableFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{`Add New ${isSource ? 'Source' : 'Target'} Table`}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Name"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
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
            Add Table
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Column Form Component
interface ColumnFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    data_type: string;
    table_id: number;
    description?: string;
    is_primary_key?: boolean;
    is_nullable?: boolean;
  }) => void;
  tables: TableType[];
  isSource: boolean;
  isLoading?: boolean;
}

function ColumnForm({
  open,
  onClose,
  onSubmit,
  tables,
  isSource,
  isLoading = false,
}: ColumnFormProps) {
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState('');
  const [tableId, setTableId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isPrimaryKey, setIsPrimaryKey] = useState(false);
  const [isNullable, setIsNullable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      data_type: dataType,
      table_id: tableId,
      description,
      is_primary_key: isPrimaryKey,
      is_nullable: isNullable,
    });
    setName('');
    setDataType('');
    setTableId(0);
    setDescription('');
    setIsPrimaryKey(false);
    setIsNullable(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{`Add New ${isSource ? 'Source' : 'Target'} Column`}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Table</InputLabel>
                <Select
                  value={tableId || ''}
                  onChange={(e) => setTableId(Number(e.target.value))}
                  label="Table"
                  disabled={isLoading}
                >
                  <MenuItem value={0} disabled>
                    Select a table
                  </MenuItem>
                  {tables.map((table) => (
                    <MenuItem key={table.id} value={table.id}>
                      {table.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="normal"
                label="Column Name"
                type="text"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  label="Data Type"
                  disabled={isLoading}
                >
                  <MenuItem value="" disabled>
                    Select a data type
                  </MenuItem>
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="integer">Integer</MenuItem>
                  <MenuItem value="float">Float</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="datetime">DateTime</MenuItem>
                  <MenuItem value="timestamp">Timestamp</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="array">Array</MenuItem>
                  <MenuItem value="binary">Binary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Is Primary Key</InputLabel>
                <Select
                  value={isPrimaryKey ? 'true' : 'false'}
                  onChange={(e) => setIsPrimaryKey(e.target.value === 'true')}
                  label="Is Primary Key"
                  disabled={isLoading}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Is Nullable</InputLabel>
                <Select
                  value={isNullable ? 'true' : 'false'}
                  onChange={(e) => setIsNullable(e.target.value === 'true')}
                  label="Is Nullable"
                  disabled={isLoading}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !name || !dataType || !tableId}
          >
            Add Column
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function TablesPage() {
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  
  // State for dialogs
  const [sourceTableFormOpen, setSourceTableFormOpen] = useState(false);
  const [targetTableFormOpen, setTargetTableFormOpen] = useState(false);
  const [sourceColumnFormOpen, setSourceColumnFormOpen] = useState(false);
  const [targetColumnFormOpen, setTargetColumnFormOpen] = useState(false);
  
  // Fetch data
  const { data: sourceTables, isLoading: isLoadingSourceTables, error: sourceTablesError } = useSourceTables();
  const { data: targetTables, isLoading: isLoadingTargetTables, error: targetTablesError } = useTargetTables();
  const { data: sourceColumns, isLoading: isLoadingSourceColumns, error: sourceColumnsError } = useSourceColumns();
  const { data: targetColumns, isLoading: isLoadingTargetColumns, error: targetColumnsError } = useTargetColumns();
  
  // Mutations
  const { mutate: createSourceTable, isPending: isCreatingSourceTable } = useCreateSourceTable();
  const { mutate: createTargetTable, isPending: isCreatingTargetTable } = useCreateTargetTable();
  const { mutate: createSourceColumn, isPending: isCreatingSourceColumn } = useCreateSourceColumn();
  const { mutate: createTargetColumn, isPending: isCreatingTargetColumn } = useCreateTargetColumn();
  
  // Event handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleCreateSourceTable = (data: { name: string; description?: string }) => {
    createSourceTable(data, {
      onSuccess: () => {
        setSourceTableFormOpen(false);
      },
    });
  };
  
  const handleCreateTargetTable = (data: { name: string; description?: string }) => {
    createTargetTable(data, {
      onSuccess: () => {
        setTargetTableFormOpen(false);
      },
    });
  };
  
  const handleCreateSourceColumn = (data: any) => {
    createSourceColumn(data, {
      onSuccess: () => {
        setSourceColumnFormOpen(false);
      },
    });
  };
  
  const handleCreateTargetColumn = (data: any) => {
    createTargetColumn(data, {
      onSuccess: () => {
        setTargetColumnFormOpen(false);
      },
    });
  };
  
  // Loading and error states
  const isLoading =
    isLoadingSourceTables ||
    isLoadingTargetTables ||
    isLoadingSourceColumns ||
    isLoadingTargetColumns;
  
  const error = sourceTablesError || targetTablesError || sourceColumnsError || targetColumnsError;
  
  if (error) {
    return (
      <MainLayout>
        <Alert severity="error">Error loading data: {error.message}</Alert>
      </MainLayout>
    );
  }
  
  // Helper function to group columns by table
  const getColumnsForTable = (tableId: number, columns: Column[] = []) => {
    return columns.filter((column) => column.table_id === tableId);
  };
  
  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Tables and Columns
          </Typography>
        </Box>
        
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="table tabs">
              <Tab label="Source Tables" id="table-tab-0" aria-controls="table-tabpanel-0" />
              <Tab label="Target Tables" id="table-tab-1" aria-controls="table-tabpanel-1" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Source Tables</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setSourceColumnFormOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Add Column
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setSourceTableFormOpen(true)}
                >
                  Add Table
                </Button>
              </Box>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : sourceTables && sourceTables.length > 0 ? (
              <div>
                {sourceTables.map((table) => (
                  <Accordion key={table.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {table.name}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {table.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {table.description}
                        </Typography>
                      )}
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Column Name</TableCell>
                              <TableCell>Data Type</TableCell>
                              <TableCell>Attributes</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getColumnsForTable(table.id, sourceColumns).map((column) => (
                              <TableRow key={column.id}>
                                <TableCell>{column.name}</TableCell>
                                <TableCell>{column.data_type}</TableCell>
                                <TableCell>
                                  {column.is_primary_key && (
                                    <Chip
                                      label="PK"
                                      size="small"
                                      color="primary"
                                      sx={{ mr: 0.5 }}
                                    />
                                  )}
                                  {!column.is_nullable && (
                                    <Chip
                                      label="NOT NULL"
                                      size="small"
                                      color="secondary"
                                      sx={{ mr: 0.5 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{column.description}</TableCell>
                              </TableRow>
                            ))}
                            {getColumnsForTable(table.id, sourceColumns).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  No columns defined for this table
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            ) : (
              <Alert severity="info">No source tables found. Add a table to get started.</Alert>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Target Tables</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setTargetColumnFormOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Add Column
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setTargetTableFormOpen(true)}
                >
                  Add Table
                </Button>
              </Box>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : targetTables && targetTables.length > 0 ? (
              <div>
                {targetTables.map((table) => (
                  <Accordion key={table.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {table.name}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {table.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {table.description}
                        </Typography>
                      )}
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Column Name</TableCell>
                              <TableCell>Data Type</TableCell>
                              <TableCell>Attributes</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getColumnsForTable(table.id, targetColumns).map((column) => (
                              <TableRow key={column.id}>
                                <TableCell>{column.name}</TableCell>
                                <TableCell>{column.data_type}</TableCell>
                                <TableCell>
                                  {column.is_primary_key && (
                                    <Chip
                                      label="PK"
                                      size="small"
                                      color="primary"
                                      sx={{ mr: 0.5 }}
                                    />
                                  )}
                                  {!column.is_nullable && (
                                    <Chip
                                      label="NOT NULL"
                                      size="small"
                                      color="secondary"
                                      sx={{ mr: 0.5 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{column.description}</TableCell>
                              </TableRow>
                            ))}
                            {getColumnsForTable(table.id, targetColumns).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  No columns defined for this table
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            ) : (
              <Alert severity="info">No target tables found. Add a table to get started.</Alert>
            )}
          </TabPanel>
        </Paper>
      </Box>
      
      {/* Forms */}
      <TableForm
        open={sourceTableFormOpen}
        onClose={() => setSourceTableFormOpen(false)}
        onSubmit={handleCreateSourceTable}
        isSource={true}
        isLoading={isCreatingSourceTable}
      />
      
      <TableForm
        open={targetTableFormOpen}
        onClose={() => setTargetTableFormOpen(false)}
        onSubmit={handleCreateTargetTable}
        isSource={false}
        isLoading={isCreatingTargetTable}
      />
      
      <ColumnForm
        open={sourceColumnFormOpen}
        onClose={() => setSourceColumnFormOpen(false)}
        onSubmit={handleCreateSourceColumn}
        tables={sourceTables || []}
        isSource={true}
        isLoading={isCreatingSourceColumn}
      />
      
      <ColumnForm
        open={targetColumnFormOpen}
        onClose={() => setTargetColumnFormOpen(false)}
        onSubmit={handleCreateTargetColumn}
        tables={targetTables || []}
        isSource={false}
        isLoading={isCreatingTargetColumn}
      />
    </MainLayout>
  );
} 