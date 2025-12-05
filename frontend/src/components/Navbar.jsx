import React, { useCallback } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Logout } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebarCollapse, setSidebarCollapsed } from '../store/slices/uiSlice';
import { logoutUser, selectUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

/**
 * MenuAppBar - Application top navigation bar
 */
const MenuAppBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleMenuClick = useCallback(() => {
    isMobile ? dispatch(setSidebarCollapsed(false)) : dispatch(toggleSidebarCollapse());
  }, [dispatch, isMobile]);

  const getRoleColor = useCallback((role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'staff':
      default:
        return 'success';
    }
  }, []);

  const buttonStyles = {
    color: 'white',
    borderRadius: 0,
    fontSize: isMobile ? '0.8rem' : '0.875rem',
    borderColor: 'rgba(255,255,255,0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#FFFDD0',
      borderColor: 'rgba(255,255,255,0.7)',
    },
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
        color: 'white',
        boxShadow: 'none',
        zIndex: 1200,
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ px: isSmallMobile ? 1 : 2 }}>
        {/* Sidebar toggle */}
        <IconButton
          size={isSmallMobile ? 'medium' : 'large'}
          edge="start"
          color="inherit"
          aria-label="toggle menu"
          onClick={handleMenuClick}
          sx={{
            mr: isSmallMobile ? 1 : 2,
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 0,
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* App title */}
        <Typography
          variant={isSmallMobile ? 'h5' : 'h4'}
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          PBIS
        </Typography>

        {/* Right-side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isSmallMobile ? 0.5 : 1 }}>
          {!isSmallMobile && (
            <Chip
              label={user?.role || 'Staff'}
              size="small"
              color={getRoleColor(user?.role)}
              sx={{
                height: 20,
                fontSize: '0.65rem',
                borderRadius: 0,
              }}
            />
          )}

          {isSmallMobile ? (
            <IconButton onClick={handleLogout} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }} aria-label="Logout">
              <Logout />
            </IconButton>
          ) : (
            <Button onClick={handleLogout} startIcon={<Logout />} sx={buttonStyles}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(MenuAppBar);
