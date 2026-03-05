import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer.jsx';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
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
    useMediaQuery,
    useTheme,
} from '@mui/material';


//---------------------------------------
// :: LoginDesign Function 
//---------------------------------------


/*
A responsive login screen with a gradient background, branded card layout, username/password inputs with visibility toggle, and a submit button.
*/

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


    //---------------------------------------
    // :: inputProps Function 
    //---------------------------------------


    /*
    A helper that configures TextField adornments, including an optional password visibility toggle icon.
    */


    const inputProps = (icon, showToggle = false) => ({
        startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
        endAdornment: showToggle && (
            <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size={isMobile ? 'small' : 'medium'}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
            </InputAdornment>
        ),
    });


    //---------------------------------------
    // :: buttonSx Function 
    //---------------------------------------


    /*
    Styling configuration for the login button, adjusting padding, typography, and gradient background for normal and hover states based on screen size.
    */


    const buttonSx = {
        py: isMobile ? 1 : 1.5,
        fontSize: isMobile ? '0.9rem' : '1rem',
        fontWeight: 700,
        borderRadius: '12px',
        backgroundColor: '#7c3aed',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': { 
            backgroundColor: '#6d28d9',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'
        },
    };


    //---------------------------------------
    // :: Return Code
    //---------------------------------------


    /*
    A responsive login layout with a gradient background, centered card, logo badge, and a form for username/password entry.
    */


    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                    opacity: 0.05,
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.3 }}
                    style={{ width: '100%', maxWidth: isMobile ? '100%' : 440 }}
                >
                    <Card
                        sx={{
                            width: '100%',
                            borderRadius: 4,
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                            position: 'relative',
                            overflow: 'visible',
                            border: '1px solid',
                            borderColor: 'divider',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: isMobile ? -30 : -40,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: isMobile ? 64 : 80,
                            height: isMobile ? 64 : 80,
                            borderRadius: 3,
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <img
                            src="https://d2s742iet3d3t1.cloudfront.net/restaurant_service/restaurants/8179d542-9c1c-4dd4-8446-813b268b5d49/Restaurant/adc7a5c5-c043-4f3a-9b02-94acc38b0095.png?size=small"
                            alt="Logo"
                            style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        />
                    </Box>

                    <CardContent sx={{ pt: isMobile ? 6 : 8, px: isMobile ? 3 : 5, pb: isMobile ? 4 : 5 }}>

                        <Box sx={{ textAlign: 'center', mb: isMobile ? 3 : 4 }}>
                            <Typography
                                variant={isMobile ? 'h5' : 'h4'}
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '-0.025em',
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                }}
                            >
                                PBIS PORTAL
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Professional Inventory Management
                            </Typography>
                        </Box>


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
                                InputProps={inputProps(<Person color="action" />)}
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
                                InputProps={inputProps(<Lock color="action" />, true)}
                            />
                            <Button type="submit" fullWidth variant="contained" disabled={loading} size={isMobile ? 'medium' : 'large'} sx={buttonSx}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                </motion.div>
            </Box>

            <Footer />
        </Box>
    );
}
