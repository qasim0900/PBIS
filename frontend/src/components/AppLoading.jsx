import { Box, Skeleton, Container, Stack } from '@mui/material';

export default function AppLoading() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3} alignItems="center">
          {/* Logo Skeleton */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Skeleton variant="circular" width={60} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          </Box>

          {/* Title */}
          <Skeleton variant="text" width={200} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />

          {/* Form Fields */}
          <Skeleton variant="rounded" width="100%" height={56} />
          <Skeleton variant="rounded" width="100%" height={56} />
          <Skeleton variant="rounded" width="100%" height={56} />

          {/* Button */}
          <Skeleton variant="rounded" width="100%" height={56} />

          {/* Footer */}
          <Box sx={{ mt: 4, width: '100%' }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}