import { Box, Typography, Link, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Phone, Email, LocationOn, Facebook, Twitter, Instagram } from '@mui/icons-material';


//---------------------------------------
// :: Footer Selectors 
//---------------------------------------


/*
A responsive footer component displaying contact details, social links, 
and copyright information with a blurred background style.
*/

export default function Footer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    //---------------------------------------
    // :: contactInfo List
    //---------------------------------------


    /*
    A list of contact details with icons and optional clickable links for phone and email.
    */

    const contactInfo = [
        { icon: <LocationOn sx={{ fontSize: 20, opacity: 0.9 }} />, text: '754 S. Crouse Ave. Syracuse, NY 13210' },
        { icon: <Phone sx={{ fontSize: 20, opacity: 0.9 }} />, text: 'Store: 315-802-2282', link: 'tel:3158022282' },
        { icon: <Phone sx={{ fontSize: 20, opacity: 0.9 }} />, text: 'Mobile: 315-657-2229', link: 'tel:3156572229' },
        { icon: <Email sx={{ fontSize: 20, opacity: 0.9 }} />, text: 'Luke@purplebananaLLC.com', link: 'mailto:Luke@purplebananaLLC.com' },
    ];


    //---------------------------------------
    // :: Social Links
    //---------------------------------------


    /*
    A set of social media links with corresponding icons for Facebook, Instagram, and Twitter.
    */

    const socialLinks = [
        { icon: <Facebook />, href: 'https://facebook.com/PurpleBananaOnTheHill' },
        { icon: <Instagram />, href: 'https://instagram.com/purplebanana315' },
        { icon: <Twitter />, href: 'https://twitter.com/purplebanana315' },
    ];


    //---------------------------------------
    // :: iconBtnSx Function
    //---------------------------------------


    /*
    A style object defining the appearance of social icon buttons, including hover effects.
    */

    const iconBtnSx = {
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
    };


    //---------------------------------------
    // :: Return Code
    //---------------------------------------


    /*
    A responsive footer component displaying contact details, social links, and copyright information with a blurred background.
    */

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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: 1 }}>
                    {contactInfo.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.icon}
                            {item.link ? (
                                <Link href={item.link} color="inherit" underline="hover">
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{item.text}</Typography>
                                </Link>
                            ) : (
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>{item.text}</Typography>
                            )}
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>Follow Us</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {socialLinks.map((social, idx) => (
                            <IconButton
                                key={idx}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={iconBtnSx}
                                size={isMobile ? 'small' : 'medium'}
                            >
                                {social.icon}
                            </IconButton>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ textAlign: isMobile ? 'center' : 'right' }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        © {new Date().getFullYear()} Purple Banana Inventory System
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>All rights reserved</Typography>
                </Box>
            </Box>
        </Box>
    );
}
