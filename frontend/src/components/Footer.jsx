import React from 'react';
import { Box, Container, Typography, Link, IconButton, useTheme } from '@mui/material';
import { GitHub, Twitter, LinkedIn, Instagram } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: '#6B21A8',
        color: '#EDE9FE',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
              PBIS
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 300 }}>
              Professional Inventory Management System designed for efficiency and modern workflows.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'white' }}>
                Quick Links
              </Typography>
              <Link href="#" sx={{ color: '#22D3EE', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Dashboard
              </Link>
              <Link href="#" sx={{ color: '#22D3EE', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Inventory
              </Link>
              <Link href="#" sx={{ color: '#22D3EE', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Reports
              </Link>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'white' }}>
                Support
              </Typography>
              <Link href="#" sx={{ color: '#22D3EE', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Help Center
              </Link>
              <Link href="#" sx={{ color: '#22D3EE', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Contact Us
              </Link>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {[GitHub, Twitter, LinkedIn, Instagram].map((Icon, index) => (
              <IconButton
                key={index}
                sx={{
                  color: 'white',
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#22D3EE',
                    transform: 'scale(1.1)',
                    filter: 'drop-shadow(0 0 8px #22D3EE)',
                  },
                }}
              >
                <Icon />
              </IconButton>
            ))}
          </Box>
        </Box>
        
        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(237, 233, 254, 0.1)', textAlign: 'center' }}>
          <Typography variant="caption">
            © {new Date().getFullYear()} PBIS. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
