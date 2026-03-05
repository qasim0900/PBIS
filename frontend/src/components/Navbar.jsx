import { persistor } from '../index';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Logout, Menu as MenuIcon } from '@mui/icons-material';
import { logoutUser, selectUser } from '../pages/loginView/authSlice';
import { toggleSidebarCollapse, setSidebarCollapsed } from '../api/uiSlice';
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
import api from '../api/axiosConfig';
import { MotionButton, hoverProps } from './MotionComponents.jsx';


//---------------------------------------
// :: useMenu AppBar Logic Function
//---------------------------------------

/*
A custom hook that provides menu bar logic, including responsive checks, user info, logout handling,
sidebar toggling, and role-based colour mapping.
*/


const useMenuAppBarLogic = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector(selectUser);


  //---------------------------------------
  // :: handle Logout Function
  //---------------------------------------

  /*
  An async callback that logs out the user by clearing Redux state, storage, API headers, browser caches, 
  and then redirects to the login page.
  */

  const handleLogout = useCallback(async () => {
    try {
      dispatch(logoutUser());
      await persistor.purge();
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common['Authorization'];

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      dispatch({ type: 'RESET_ALL' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.replace('/login');
    }
  }, [dispatch]);


  //---------------------------------------
  // :: handle Menu Click Function
  //---------------------------------------

  /*
  A callback that toggles the sidebar collapse state, using different actions based on whether the device is mobile.
  */

  const handleMenuClick = useCallback(() => {
    isMobile ? dispatch(setSidebarCollapsed(false)) : dispatch(toggleSidebarCollapse());
  }, [dispatch, isMobile]);


  //---------------------------------------
  // :: Role Color Function
  //---------------------------------------

  /*
  A callback that maps user roles to MUI colour codes and returns it along with logout, menu toggle functions, 
  responsive flags, and the current user.
  */

  const roleColor = useCallback((role) => {
    const map = { admin: 'error', manager: 'warning', staff: 'success' };
    return map[role] || 'success';
  }, []);

  return { handleLogout, handleMenuClick, roleColor, isMobile, isSmallMobile, user };
};


//---------------------------------------
// :: Menu AppBar Function
//---------------------------------------

/*
A responsive AppBar component for PBIS that displays a menu toggle, user role chip, and 
logout button with adaptive styles for mobile and desktop views.
*/


const MenuAppBar = () => {

  const { handleLogout, handleMenuClick, roleColor, isMobile, isSmallMobile, user } =
    useMenuAppBarLogic();


  //---------------------------------------
  // :: logout Button Styles Function
  //---------------------------------------

  /*
  A memoized style object for the logout button that adjusts font size for mobile and applies custom hover effects.
  */

  const logoutButtonStyles = useMemo(
    () => ({
      color: '#475569',
      borderRadius: 2,
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      borderColor: '#e2e8f0',
      background: 'transparent',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        color: '#ef4444',
        borderColor: '#fecaca',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      transition: 'all 0.2s ease-in-out',
    }),
    [isMobile]
  );


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  A fixed, responsive AppBar with a gradient background that shows a menu toggle for non-staff users, the app title, a role chip on larger screens, 
  and a logout button that adapts between icon and text for mobile.
  */

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        color: '#1e293b',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        zIndex: 1200,
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ px: isSmallMobile ? 1 : 2 }}>
        {user?.role !== 'staff' && (
          <IconButton
            size={isSmallMobile ? 'medium' : 'large'}
            edge="start"
            color="inherit"
            aria-label="toggle menu"
            onClick={handleMenuClick}
            sx={{
              mr: isSmallMobile ? 1 : 2,
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                color: '#7c3aed',
                transform: 'translateX(2px)',
              },
            }}
            {...hoverProps}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant={isSmallMobile ? 'h6' : 'h5'}
          component="div"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 800,
            letterSpacing: '-0.025em',
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PBIS PORTAL
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isSmallMobile ? 0.5 : 1 }}>
          {!isSmallMobile && (
            <Chip
              label={user?.role || 'Staff'}
              size="small"
              color={roleColor(user?.role)}
              sx={{ 
                height: 24, 
                fontSize: '0.7rem', 
                borderRadius: 12,
                fontWeight: 600,
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            />
          )}

          {isSmallMobile ? (
            <IconButton
              onClick={handleLogout}
              sx={{ 
                color: '#64748b', 
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  transform: 'scale(1.05)',
                },
              }}
              aria-label="Logout"
              {...hoverProps}
            >
              <Logout />
            </IconButton>
          ) : (
            <MotionButton
              component={Button}
              onClick={handleLogout} 
              startIcon={<Logout />} 
              sx={logoutButtonStyles}
              variant="outlined"
              {...hoverProps}
            >
              Logout
            </MotionButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};


//---------------------------------------
// :: Export Memo Menu AppBar
//---------------------------------------

/*
Exports the `MenuAppBar` component wrapped in `React.memo` to optimise rendering by preventing unnecessary re-renders.
*/

export default React.memo(MenuAppBar);
