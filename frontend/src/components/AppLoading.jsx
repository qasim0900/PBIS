import {
  Box,
  Container,
  Stack,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useEffect, useState } from 'react';

/*
Professional Enterprise Loading Screen for PBIS
Clean • Corporate • Dark Theme • Minimal Animation
*/

export default function AppLoading() {
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Initializing system...',
    'Loading inventory modules...',
    'Preparing dashboard...',
    'Finalizing setup...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0B1220 0%, #1C2541 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center">

          {/* PBIS Logo Box */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              animation: 'fadeInScale 0.6s ease-out',
            }}
          >
            <Typography
              sx={{
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: 2,
                color: '#FFFFFF',
              }}
            >
              PBIS
            </Typography>
          </Box>

          {/* Title */}
          <Stack spacing={1} alignItems="center">
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                animation: 'fadeInUp 0.6s ease-out 0.2s both',
              }}
            >
              PBIS
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 400,
                animation: 'fadeInUp 0.6s ease-out 0.3s both',
              }}
            >
              Pharmacy Billing & Inventory System
            </Typography>
          </Stack>

          {/* Loading Text */}
          <Chip
            label={loadingSteps[loadingStep]}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#E5E7EB',
              fontSize: '0.85rem',
              px: 2,
              animation: 'fadeIn 0.4s ease-out',
            }}
          />

          {/* Loader */}
          <CircularProgress
            size={50}
            thickness={4}
            sx={{
              color: '#6366F1',
              animation: 'fadeIn 0.6s ease-out 0.4s both',
            }}
          />

        </Stack>
      </Container>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
}