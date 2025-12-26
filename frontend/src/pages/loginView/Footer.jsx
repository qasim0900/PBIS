import { Box, Typography, Link, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Phone, Email, LocationOn, Facebook, Twitter, Instagram } from '@mui/icons-material';

export default function Footer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            component="footer"
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

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
                        Follow Us
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            href="https://facebook.com/PurpleBananaOnTheHill"
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

                        <IconButton
                            href="https://instagram.com/purplebanana315"
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

                        <IconButton
                            href="https://twitter.com/purplebanana315"
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
    );
}
