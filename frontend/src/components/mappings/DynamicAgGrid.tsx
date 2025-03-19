'use client';

import { useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { GridOptions } from 'ag-grid-community';

interface DynamicAgGridProps {
  rowData: any[];
  columnDefs: any[];
  defaultColDef?: any;
  onGridReady?: (params: any) => void;
  gridOptions?: GridOptions;
}

export default function DynamicAgGrid({
  rowData,
  columnDefs,
  defaultColDef,
  onGridReady,
  gridOptions = {},
}: DynamicAgGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle grid initialization and cleanup
  useEffect(() => {
    // Ensure grid sizing is calculated correctly after mounting
    const handleResize = () => {
      if (gridRef.current && gridRef.current.api) {
        setTimeout(() => {
          gridRef.current?.api?.sizeColumnsToFit();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // Manually trigger resize on first render to ensure proper sizing
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clean up grid API on unmount
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.destroy();
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        suppressPropertyNamesCheck={true}
        reactiveCustomComponents={true}
        {...gridOptions}
      />
    </div>
  );
} 