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
      color: 'white',
      borderRadius: 0,
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      borderColor: 'rgba(255,255,255,0.7)',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#FFFDD0',
        borderColor: 'rgba(255,255,255,0.7)',
      },
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
        background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: 'white',
        boxShadow: 'none',
        zIndex: 1200,
        borderRadius: 0,
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
              borderRadius: 0,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant={isSmallMobile ? 'h5' : 'h4'}
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          PBIS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isSmallMobile ? 0.5 : 1 }}>
          {!isSmallMobile && (
            <Chip
              label={user?.role || 'Staff'}
              size="small"
              color={roleColor(user?.role)}
              sx={{ height: 20, fontSize: '0.65rem', borderRadius: 0 }}
            />
          )}

          {isSmallMobile ? (
            <IconButton
              onClick={handleLogout}
              sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}
              aria-label="Logout"
            >
              <Logout />
            </IconButton>
          ) : (
            <Button onClick={handleLogout} startIcon={<Logout />} sx={logoutButtonStyles}>
              Logout
            </Button>
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
