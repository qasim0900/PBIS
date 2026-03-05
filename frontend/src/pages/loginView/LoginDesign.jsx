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
        borderRadius: '16px',
        backgroundColor: '#A855F7',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': { 
            backgroundColor: '#C084FC',
            transform: 'scale(1.05)',
            boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.4)'
        },
    };


    //---------------------------------------
    // :: Return Code
    //---------------------------------------


    /*
    A responsive login layout with a gradient background, centered card, logo badge, and a form for username/password entry.
    */


    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F9FAFB' }}>
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    background: 'linear-gradient(135deg, #A855F7 0%, #D8B4FE 100%)',
                    opacity: 0.15,
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
                    style={{ width: '100%', maxWidth: isMobile ? '100%' : 440 }}
                >
                    <Card
                        sx={{
                            width: '100%',
                            borderRadius: 6,
                            boxShadow: '0 25px 50px -12px rgba(107, 70, 193, 0.25)',
                            position: 'relative',
                            overflow: 'visible',
                            border: '1px solid rgba(216, 180, 254, 0.3)',
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(255, 255, 255, 0.95)',
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
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src="https://d2s742iet3d3t1.cloudfront.net/restaurant_service/restaurants/8179d542-9c1c-4dd4-8446-813b268b5d49/Restaurant/adc7a5c5-c043-4f3a-9b02-94acc38b0095.png?size=small"
                            alt="Logo"
                            style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        />
                    </Box>

                    <CardContent sx={{ pt: isMobile ? 5 : 7, px: isMobile ? 2 : 4, pb: isMobile ? 3 : 4 }}>

                        <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 4 }}>
                            <Typography
                                variant={isMobile ? 'h5' : 'h4'}
                                sx={{
                                    fontWeight: 800,
                                    color: '#6B21A8',
                                    mb: 1,
                                    letterSpacing: '-0.025em'
                                }}
                            >
                                PBIS
                            </Typography>
                            <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
                                Inventory Management System
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
