'use client';

import { Typography, Box, CircularProgress } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the ReleaseManager component with SSR disabled
const ReleaseManager = dynamic(
  () => import('@/components/releases/ReleaseManager'),
  { ssr: false }
);

export default function ReleasesPage() {
  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Release Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Manage releases for your source-to-target mappings. Releases help organize mappings into
          deployable units and track their progress through the development lifecycle.
        </Typography>
        
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        }>
          <ReleaseManager />
        </Suspense>
      </Box>
    </MainLayout>
  );
} 