import {
  Box,
  Container,
  Stack,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Stack spacing={1} alignItems="center">
              <Typography
                variant="h4"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                PBIS
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 400,
                }}
              >
                Pharmacy Billing & Inventory System
              </Typography>
            </Stack>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            key={loadingStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Chip
              label={loadingSteps[loadingStep]}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#E5E7EB',
                fontSize: '0.85rem',
                px: 2,
              }}
            />
          </motion.div>

          {/* Loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <CircularProgress
              size={50}
              thickness={4}
              sx={{
                color: '#6366F1',
              }}
            />
          </motion.div>

        </Stack>
      </Container>
    </Box>
  );
}
