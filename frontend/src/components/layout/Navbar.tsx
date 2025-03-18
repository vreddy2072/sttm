'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Mappings', path: '/mappings' },
  { name: 'Tables', path: '/tables' },
  { name: 'Releases', path: '/releases' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        STTM App
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <Link href={item.path} style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton
                sx={{ textAlign: 'center' }}
                selected={pathname === item.path}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Source-to-Target Mapping
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Link key={item.name} href={item.path} style={{ textDecoration: 'none' }}>
                <Button 
                  sx={{ 
                    color: '#fff',
                    backgroundColor: pathname === item.path ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
} 