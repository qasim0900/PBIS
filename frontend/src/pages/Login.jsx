import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Inventory2,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';
import { loginUser, selectAuth, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(selectAuth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/counts');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ username, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/counts');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 2 : 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            maxWidth: isMobile ? '100%' : 440,
            width: '100%',
            borderRadius: isMobile ? 2 : 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'visible',
            mx: isMobile ? 1 : 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? -30 : -40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? 60 : 80,
              height: isMobile ? 60 : 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Inventory2 sx={{ fontSize: isMobile ? 28 : 40, color: 'white' }} />
          </Box>

          <CardContent sx={{ pt: isMobile ? 5 : 7, px: isMobile ? 2 : 4, pb: isMobile ? 3 : 4 }}>
            <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 4 }}>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                PBIS
              </Typography>
              <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
                Inventory Management System
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: 2 }}
                onClose={() => dispatch(clearError())}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                size={isMobile ? 'small' : 'medium'}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size={isMobile ? 'small' : 'medium'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size={isMobile ? 'medium' : 'large'}
                disabled={loading}
                sx={{
                  py: isMobile ? 1 : 1.5,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>

      <Box component="footer"
        sx={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          py: isMobile ? 3 : 4,
          px: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 3 : 4,
          }}
        >
          {/* LEFT SIDE - CONTACT INFO */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMobile ? 'center' : 'flex-start',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                754 S. Crouse Ave. Syracuse, NY 13210
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 20, opacity: 0.9 }} />
              <Link href="tel:3158022282" color="inherit" underline="hover">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Store: 315-802-2282
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 20, opacity: 0.9 }} />
              <Link href="tel:3156572229" color="inherit" underline="hover">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Mobile: 315-657-2229
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email sx={{ fontSize: 20, opacity: 0.9 }} />
              <Link href="mailto:Luke@purplebananaLLC.com" color="inherit" underline="hover">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Luke@purplebananaLLC.com
                </Typography>
              </Link>
            </Box>
          </Box>

          {/* SOCIAL MEDIA */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
              Follow Us
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton href="https://facebook.com/PurpleBananaOnTheHill"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <Facebook />
              </IconButton>

              <IconButton href="https://instagram.com/purplebanana315"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <Instagram />
              </IconButton>

              <IconButton href="https://twitter.com/purplebanana315"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <Twitter />
              </IconButton>
            </Box>
          </Box>

          {/* COPYRIGHT */}
          <Box sx={{ textAlign: isMobile ? 'center' : 'right' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Purple Banana Inventory System
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              All rights reserved
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default Login;
