import { motion } from 'framer-motion';
import Footer from './Footer.jsx';
import { Visibility, VisibilityOff, Person, Lock, Login as LoginIcon } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton,
    Stack,
    useMediaQuery,
    useTheme,
} from '@mui/material';

const fadeIn = { 
    initial: { opacity: 0 }, 
    animate: { opacity: 1 }, 
    transition: { duration: 0.6 } 
};

const slideUp = { 
    initial: { opacity: 0, y: 30 }, 
    animate: { opacity: 1, y: 0 }, 
    transition: { duration: 0.5, ease: "easeOut" } 
};

const scaleIn = { 
    initial: { scale: 0, opacity: 0 }, 
    animate: { scale: 1, opacity: 1 }, 
    transition: { type: 'spring', duration: 0.6, delay: 0.2 } 
};

export default function LoginDesign({
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleSubmit,
    loading,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const inputProps = (icon, showToggle = false) => ({
        startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
        endAdornment: showToggle && (
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
    });

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    opacity: 0.05,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, p: 2 }}>
                <motion.div initial="initial" animate="animate" variants={slideUp} style={{ width: '100%', maxWidth: 400 }}>
                    <Card
                        sx={{
                            width: '100%',
                            borderRadius: isMobile ? 3 : 5,
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            overflow: 'visible',
                            position: 'relative',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <motion.div initial="initial" animate="animate" variants={scaleIn}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    top: isMobile ? -30 : -40,
                                    width: isMobile ? 60 : 80,
                                    height: isMobile ? 60 : 80,
                                    bgcolor: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                }}
                            >
                                <Box 
                                    component="img"
                                    src="https://d2s742iet3d3t1.cloudfront.net/restaurant_service/restaurants/8179d542-9c1c-4dd4-8446-813b268b5d49/Restaurant/adc7a5c5-c043-4f3a-9b02-94acc38b0095.png?size=small"
                                    alt="Logo"
                                    sx={{ width: '80%', height: '80%', objectFit: 'contain' }}
                                />
                            </Box>
                        </motion.div>

                        <CardContent sx={{ pt: isMobile ? 6 : 8, px: { xs: 3, sm: 5 }, pb: 5 }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography
                                    variant={isMobile ? 'h4' : 'h3'}
                                    sx={{ 
                                        fontWeight: 800, 
                                        color: '#7c3aed', 
                                        letterSpacing: '-0.02em',
                                        mb: 1
                                    }}
                                >
                                    PBIS
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Inventory Management System
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        autoFocus
                                        InputProps={inputProps(<Person sx={{ color: '#7c3aed' }} />)}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        InputProps={inputProps(<Lock sx={{ color: '#7c3aed' }} />, true)}
                                    />

                                    <Button 
                                        type="submit" 
                                        fullWidth 
                                        variant="contained" 
                                        disabled={loading} 
                                        size="large"
                                        startIcon={!loading && <LoginIcon />}
                                        sx={{
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            borderRadius: 2.5,
                                            backgroundColor: '#7c3aed',
                                            boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.4)',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#6d28d9',
                                                boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.4)',
                                            }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </Box>

            <Footer />
        </Box>
    );
}
