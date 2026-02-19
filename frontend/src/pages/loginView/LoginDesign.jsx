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
        fontWeight: 600,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
    };


    //---------------------------------------
    // :: Return Code
    //---------------------------------------


    /*
    A responsive login layout with a gradient background, centered card, logo badge, and a form for username/password entry.
    */


    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                <Card
                    sx={{
                        maxWidth: isMobile ? '100%' : 440,
                        width: '100%',
                        borderRadius: isMobile ? 2 : 4,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        mx: isMobile ? 1 : 0,
                        position: 'relative',
                        overflow: 'visible',
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
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
            </Box>

            <Footer />
        </Box>
    );
}
