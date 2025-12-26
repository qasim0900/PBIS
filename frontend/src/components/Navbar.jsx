import { persistor } from "../index";
import { Logout } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../pages/loginView/authSlice';
import { toggleSidebarCollapse, setSidebarCollapsed } from '../pages/uiSlice';
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



const useMenuAppBarLogic = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector(selectUser);


  const handleLogout = useCallback(async () => {
    try {
      dispatch(logoutUser());
      await persistor.purge();
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common["Authorization"];
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }
      dispatch({ type: "RESET_ALL" });

    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.replace("/login");
    }
  }, [dispatch]);


  const handleMenuClick = useCallback(() => {
    isMobile ? dispatch(setSidebarCollapsed(false)) : dispatch(toggleSidebarCollapse());
  }, [dispatch, isMobile]);
  const roleColor = useCallback((role) => {
    const roleMap = {
      admin: 'error',
      manager: 'warning',
      staff: 'success',
    };
    return roleMap[role] || 'success';
  }, []);

  return {
    handleLogout,
    handleMenuClick,
    roleColor,
    isMobile,
    isSmallMobile,
    user,
  };
};

const MenuAppBar = () => {
  const {
    handleLogout,
    handleMenuClick,
    roleColor,
    isMobile,
    isSmallMobile,
    user,
  } = useMenuAppBarLogic();

  const logoutButtonStyles = useMemo(() => ({
    color: 'white',
    borderRadius: 0,
    fontSize: isMobile ? '0.8rem' : '0.875rem',
    borderColor: 'rgba(255,255,255,0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#FFFDD0',
      borderColor: 'rgba(255,255,255,0.7)',
    },
  }), [isMobile]);

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
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
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

export default React.memo(MenuAppBar);
