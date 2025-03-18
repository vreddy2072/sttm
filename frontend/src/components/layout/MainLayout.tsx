'use client';

import { ReactNode } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
        <Container>
          <p>© {new Date().getFullYear()} Source-to-Target Mapping Application</p>
        </Container>
      </Box>
    </Box>
  );
} 