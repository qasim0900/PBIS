import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  SwipeableDrawer,
  List,
  ListItem,
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
  LocationOn,
  Category,
  People,
  Close,
  Business,
} from '@mui/icons-material';
import { selectSidebarCollapsed, setSidebarCollapsed } from '../api/uiSlice';
import { selectIsManager, selectIsAdmin } from '../pages/loginView/authSlice';


//---------------------------------------
// :: DRAWER_WIDTH/ COLLAPSED_WIDTH
//---------------------------------------

/*
Defines constants for the sidebar widths: `DRAWER_WIDTH` for the expanded state and `COLLAPSED_WIDTH` for the collapsed state.
*/

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;


//---------------------------------------
// :: Sidebar Menu Item Function
//---------------------------------------

/*
A memoized sidebar menu item that displays an icon, text, and optional badge, adapting layout and tooltip based on collapse state
and screen size, with hover and selection styling.
*/

const SidebarMenuItem = React.memo(({ item, collapsed, isMobile, selected, onClick }) => (
  <ListItem disablePadding sx={{ mb: 0.5 }}>
    <Tooltip title={collapsed && !isMobile ? item.text : ''} placement="right">
      <ListItemButton
        selected={selected}
        onClick={onClick}
        sx={{
          minHeight: 48,
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          px: collapsed && !isMobile ? 1 : 2,
          borderRadius: 0,
          '&.Mui-selected': {
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.4)' },
          },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
        }}
      >
        <ListItemIcon
          sx={{
            color: selected ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
            minWidth: collapsed && !isMobile ? 0 : 40,
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {(!collapsed || isMobile) && (
          <>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: selected ? 600 : 400,
              }}
            />
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: 0,
                }}
              />
            )}
          </>
        )}
      </ListItemButton>
    </Tooltip>
  </ListItem>
));


//---------------------------------------
// :: Sidebar Function
//---------------------------------------

/*
A sidebar component that sets up responsive state, user roles, and memoized menu items with icons, 
paths, and role-based access badges.
*/

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const collapsed = useSelector(selectSidebarCollapsed);
  const isManager = useSelector(selectIsManager);
  const isAdmin = useSelector(selectIsAdmin);

  //---------------------------------------
  // :: menu Items 
  //---------------------------------------

  /*
  A memoized array defining the sidebar menu items, each with text, icon, route path, allowed roles, and an optional badge.
  */

  const menuItems = useMemo(
    () => [
      { text: 'Survey Count', icon: <Calculate />, path: '/counts', roles: ['manager', 'admin', 'user'], badge: 'User' },
      { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['manager', 'admin'], badge: 'Manager' },
      { text: 'Frequency', icon: <CalendarViewDay />, path: '/frequencies', roles: ['manager', 'admin'], badge: 'Manager' },
      { text: 'Locations', icon: <LocationOn />, path: '/locations', roles: ['admin'], badge: 'Admin' },
      { text: 'Vendors', icon: <Business />, path: '/vendors', roles: ['admin'], badge: 'Admin' },
      { text: 'Catalog', icon: <Category />, path: '/catalog', roles: ['admin'], badge: 'Admin' },
      { text: 'Users', icon: <People />, path: '/users', roles: ['admin'], badge: 'Admin' },
    ],
    []
  );


  //---------------------------------------
  // :: has Access Function
  //---------------------------------------

  /*
  A callback that checks if the current user has access to a menu item based on their role and the item’s allowed roles.
  */

  const hasAccess = useCallback(
    (roles) => {
      if (roles.includes('all')) return true;
      if (roles.includes('manager') && isManager) return true;
      if (roles.includes('admin') && isAdmin) return true;
      return false;
    },
    [isManager, isAdmin]
  );


  //---------------------------------------
  // :: Handle Navigate Function
  //---------------------------------------

  /*
  A callback that navigates to a given path and collapses the sidebar on mobile devices.
  */

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      if (isMobile) dispatch(setSidebarCollapsed(true));
    },
    [navigate, isMobile, dispatch]
  );


  //---------------------------------------
  // :: Handle Close Function
  //---------------------------------------

  /*
  A callback that blurs the currently focused element and collapses the sidebar.
  */

  const handleClose = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    dispatch(setSidebarCollapsed(true));
  }, [dispatch]);


  //---------------------------------------
  // :: Handle Open Function
  //---------------------------------------

  /*
  A callback that expands the sidebar by setting its collapsed state to `false`.
  */

  const handleOpen = useCallback(() => dispatch(setSidebarCollapsed(false)), [dispatch]);



  //---------------------------------------
  // :: Drawer Content Function
  //---------------------------------------

  /*
  A memoized JSX block that renders the sidebar content, including a mobile header with close button, a filtered list of 
  accessible menu items, and dividers, with padding and collapse handling.
  */

  const drawerContent = useMemo(
    () => (
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
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ flex: 1, py: 2, px: collapsed && !isMobile ? 1 : 2 }}>
          <List>
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
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      </>
    ),
    [menuItems, collapsed, isMobile, location.pathname, hasAccess, handleNavigate, handleClose]
  );


  //---------------------------------------
  // :: Mobile View
  //---------------------------------------

  /*
  Renders a `SwipeableDrawer` for mobile devices that opens or closes based on the sidebar 
  state, with custom styling and the memoized drawer content.
  */

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={!collapsed}
        onClose={handleClose}
        onOpen={handleOpen}
        ModalProps={{ keepMounted: true, disableEnforceFocus: true, disableRestoreFocus: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
            color: 'white',
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders a permanent sidebar `Drawer` for desktop, adjusting its width based on 
  collapse state with smooth transitions and styled background.
  */

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        mt: '64px',
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
          color: 'white',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          borderRadius: 0,
          mt: '64px',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};


//---------------------------------------
// :: Export Memo SideBar
//---------------------------------------

/*
Exports the `Sidebar` component wrapped in `React.memo` to prevent unnecessary re-renders and optimise performance.
*/

export default React.memo(Sidebar);
