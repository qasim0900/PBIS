import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  SwipeableDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Calculate,
  CalendarViewDay,
  Assessment,
  Verified,
  LocationOn,
  Category,
  People,
  Close,
  Business,
} from '@mui/icons-material';
import { selectSidebarCollapsed, setSidebarCollapsed } from '../api/uiSlice';
import { selectIsManager, selectIsAdmin } from '../pages/loginView/authSlice';

const DRAWER_WIDTH = 250;
const COLLAPSED_WIDTH = 70;

/* ---------------- Sidebar Menu Item ---------------- */

const SidebarMenuItem = React.memo(
  ({ item, collapsed, isMobile, selected, onClick }) => (
    <ListItemButton
      onClick={onClick}
      disableRipple
      sx={{
        px: collapsed && !isMobile ? 1 : 2,
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        borderRadius: 1,
        mb: 0.5,
        minHeight: 46,
        alignItems: 'center',
        transition: 'all 0.2s ease',
        backgroundColor: selected ? 'rgba(255,255,255,0.06)' : 'transparent',

        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
      }}
    >
      <Tooltip title={collapsed && !isMobile ? item.text : ''} placement="right">
        <ListItemIcon
          sx={{
            color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
            minWidth: collapsed && !isMobile ? 0 : 38,
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
        >
          {item.icon}
        </ListItemIcon>
      </Tooltip>

      {(!collapsed || isMobile) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: selected ? 600 : 500,
              color: selected ? '#FFFFFF' : '#D1D5DB',
              whiteSpace: 'nowrap',
            }}
          />

          {item.badge && (
            <Chip
              label={item.badge}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.85)',
                borderRadius: 1,
              }}
            />
          )}
        </Box>
      )}
    </ListItemButton>
  )
);

/* ---------------- Sidebar Component ---------------- */

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const collapsed = useSelector(selectSidebarCollapsed);
  const isManager = useSelector(selectIsManager);
  const isAdmin = useSelector(selectIsAdmin);

  /* -------- Menu Items -------- */

  const menuItems = useMemo(
    () => [
      { text: 'Survey Count', icon: <Calculate />, path: '/counts', roles: ['manager', 'admin', 'user'], badge: 'User' },
      { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['manager', 'admin'], badge: 'Manager' },
      { text: 'Inventory List', icon: <CalendarViewDay />, path: '/frequencies', roles: ['manager', 'admin'], badge: 'Manager' },
      { text: 'Locations', icon: <LocationOn />, path: '/locations', roles: ['admin'], badge: 'Admin' },
      { text: 'Vendors', icon: <Business />, path: '/vendors', roles: ['admin'], badge: 'Admin' },
      { text: 'Brands', icon: <Verified />, path: '/brands', roles: ['admin'], badge: 'Admin' },
      { text: 'Catalog', icon: <Category />, path: '/catalog', roles: ['admin'], badge: 'Admin' },
      { text: 'Users', icon: <People />, path: '/users', roles: ['admin'], badge: 'Admin' },
    ],
    []
  );

  /* -------- Role Access -------- */

  const hasAccess = useCallback(
    (roles) => {
      if (roles.includes('all')) return true;
      if (roles.includes('admin') && isAdmin) return true;
      if (roles.includes('manager') && isManager) return true;
      if (roles.includes('user')) return true;
      return false;
    },
    [isManager, isAdmin]
  );

  /* -------- Navigation -------- */

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      if (isMobile) dispatch(setSidebarCollapsed(true));
    },
    [navigate, isMobile, dispatch]
  );

  const handleClose = useCallback(() => {
    dispatch(setSidebarCollapsed(true));
  }, [dispatch]);

  const handleOpen = useCallback(() => {
    dispatch(setSidebarCollapsed(false));
  }, [dispatch]);

  /* -------- Drawer Content -------- */

  const drawerContent = (
    <>
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Menu
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Box sx={{ flex: 1, py: 2, px: collapsed && !isMobile ? 1 : 2 }}>
        <List disablePadding>
          {menuItems
            .filter((item) => hasAccess(item.roles))
            .map((item) => (
              <SidebarMenuItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                isMobile={isMobile}
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              />
            ))}
        </List>
      </Box>
    </>
  );

  /* -------- Mobile -------- */

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={!collapsed}
        onClose={handleClose}
        onOpen={handleOpen}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            backgroundColor: '#1C2541',
            color: 'white',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

  /* -------- Desktop -------- */

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          backgroundColor: '#1C2541',
          color: 'white',
          border: 'none',
          overflowX: 'hidden',
          transition: 'width 0.35s ease',
          mt: '64px',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default React.memo(Sidebar);