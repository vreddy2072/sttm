'use client';

import { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Edit, Trash2, Filter, Download, Plus } from 'lucide-react';
import { EnrichedMapping } from '@/lib/api';

interface MappingGridProps {
  mappings: EnrichedMapping[];
  isLoading: boolean;
  onEdit?: (mapping: EnrichedMapping) => void;
  onDelete?: (mapping: EnrichedMapping) => void;
  onAdd?: () => void;
}

export default function MappingGrid({
  mappings,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: MappingGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<EnrichedMapping>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
      },
      {
        accessorKey: 'source_table_name',
        header: 'Source Table',
      },
      {
        accessorKey: 'source_column_name',
        header: 'Source Column',
      },
      {
        accessorKey: 'target_table_name',
        header: 'Target Table',
      },
      {
        accessorKey: 'target_column_name',
        header: 'Target Column',
      },
      {
        accessorKey: 'release_name',
        header: 'Release',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          let color = 'default';
          
          if (status === 'Released') {
            color = 'success.main';
          } else if (status === 'Draft') {
            color = 'warning.main';
          }
          
          return <Typography sx={{ color }}>{status}</Typography>;
        },
      },
      {
        accessorKey: 'jira_ticket',
        header: 'JIRA Ticket',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit(row.original)}
                  aria-label="edit"
                >
                  <Edit size={18} />
                </IconButton>
              </Tooltip>
            )}
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
        ),
      },
    ],
    [onEdit, onDelete]
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
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: header.column.getCanSort() ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                      },
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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