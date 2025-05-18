import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/Slice/AuthSlice';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Logout,
  Info,
  Home,
  MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login'); // ✅ Redirect after logout
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuBook sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              MatBook Client Portal
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              Review proposals, quotes, and explore product options
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton color="inherit">
              <Home />
            </IconButton>
          </Tooltip>

          <Tooltip title="Information">
            <IconButton color="inherit">
              <Info />
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <Button
              variant="outlined"
              color="error"
              size="medium"
              startIcon={<Logout />}
              onClick={handleLogOut}
              sx={{
                ml: 1,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
            >
              Logout
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
