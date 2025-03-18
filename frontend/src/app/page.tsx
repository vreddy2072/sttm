import { Typography, Paper, Box, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Source-to-Target Mapping Application
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          A web-based application to replace Excel-based STTM documents
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', my: 6 }}>
        <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 350 }}>
          <Typography variant="h6" gutterBottom>
            Manage Mappings
          </Typography>
          <Typography paragraph>
            Create, view, and edit source-to-target mappings with an Excel-like interface.
            Track relationships between source and target elements.
          </Typography>
          <Button component={Link} href="/mappings" variant="contained" fullWidth>
            View Mappings
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 350 }}>
          <Typography variant="h6" gutterBottom>
            Explore Tables
          </Typography>
          <Typography paragraph>
            Browse source and target tables and columns. View detailed information about
            database structure and relationships.
          </Typography>
          <Button component={Link} href="/tables" variant="contained" fullWidth>
            View Tables
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 350 }}>
          <Typography variant="h6" gutterBottom>
            Release Management
          </Typography>
          <Typography paragraph>
            Tag mappings with release numbers and track status changes.
            Filter mappings by release to see what's included in each version.
          </Typography>
          <Button component={Link} href="/mappings?view=releases" variant="contained" fullWidth>
            View Releases
          </Button>
        </Paper>
      </Box>
    </MainLayout>
  );
}
