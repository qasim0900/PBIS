// removed unused React namespace import — JSX runtime automatic with Vite
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

export default function MenuAppBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleMenuClick = () => {
    if (isMobile) {
      dispatch(setSidebarCollapsed(false));
    } else {
      dispatch(toggleSidebarCollapse());
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      default: return 'default';
    }
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
      <Toolbar sx={{ borderRadius: 0, px: isSmallMobile ? 1 : 2 }}>
        <IconButton
          size={isSmallMobile ? 'medium' : 'large'}
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          sx={{ mr: isSmallMobile ? 1 : 2, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 0 } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography 
          variant={isSmallMobile ? 'h5' : 'h4'} 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          PBIS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isSmallMobile ? 0.5 : 1, borderRadius: 0 }}>
          <Chip
            label={user?.role || 'Staff'}
            size="small"
            color={getRoleColor(user?.role)}
            sx={{ 
              height: 20, 
              fontSize: isSmallMobile ? '0.6rem' : '0.65rem', 
              borderRadius: 0,
              display: isSmallMobile ? 'none' : 'flex',
            }}
          />
          {isSmallMobile ? (
            <IconButton
              onClick={handleLogout}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Logout />
            </IconButton>
          ) : (
            <Button
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.7)',
                borderRadius: 0,
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFDD0',
                  borderColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 0,
                },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
