import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
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
  SwipeableDrawer,
} from '@mui/material';
import {
  Calculate,
  TrendingDown,
  Assessment,
  LocationOn,
  Category,
  Tune,
  People,
  Close,
} from '@mui/icons-material';
import { selectSidebarCollapsed, setSidebarCollapsed } from '../store/slices/uiSlice';
import { selectIsManager, selectIsAdmin } from '../store/slices/authSlice';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const collapsed = useSelector(selectSidebarCollapsed);
  const isManager = useSelector(selectIsManager);
  const isAdmin = useSelector(selectIsAdmin);

  // Memoised menu items to avoid recalculation on each render
  const menuItems = useMemo(
    () => [
      { text: 'Counts', icon: <Calculate />, path: '/counts', roles: ['all'] },
      { text: 'Low Stock', icon: <TrendingDown />, path: '/low-stock', roles: ['manager'], badge: 'Manager' },
      { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['manager'], badge: 'Manager' },
      { text: 'Locations', icon: <LocationOn />, path: '/locations', roles: ['admin'], badge: 'Admin' },
      { text: 'Catalog', icon: <Category />, path: '/catalog', roles: ['admin'], badge: 'Admin' },
      { text: 'Overrides', icon: <Tune />, path: '/overrides', roles: ['admin'], badge: 'Admin' },
      { text: 'Users', icon: <People />, path: '/users', roles: ['admin'], badge: 'Admin' },
    ],
    []
  );

  const hasAccess = (roles) => {
    if (roles.includes('all')) return true;
    if (roles.includes('manager') && isManager) return true;
    if (roles.includes('admin') && isAdmin) return true;
    return false;
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) dispatch(setSidebarCollapsed(true));
  };

  const handleClose = () => dispatch(setSidebarCollapsed(true));
  const handleOpen = () => dispatch(setSidebarCollapsed(false));

  const renderMenuItems = () =>
    menuItems.filter(item => hasAccess(item.roles)).map(item => {
      const selected = location.pathname === item.path;

      return (
        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
          <Tooltip title={collapsed && !isMobile ? item.text : ''} placement="right">
            <ListItemButton
              selected={selected}
              onClick={() => handleNavigate(item.path)}
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
      );
    });

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
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ flex: 1, py: 2, px: collapsed && !isMobile ? 1 : 2 }}>
        <List>{renderMenuItems()}</List>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
    </>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={!collapsed}
        onClose={handleClose}
        onOpen={handleOpen}
        disableEnforceFocus={true}
        ModalProps={{
          keepMounted: true,
          disableEnforceFocus: true,
        }}
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

  // Permanent Drawer for desktop
  return (
    <Drawer
      variant="permanent"
      ModalProps={{
        keepMounted: true,
        disableEnforceFocus: true,
      }}
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

export default Sidebar;
