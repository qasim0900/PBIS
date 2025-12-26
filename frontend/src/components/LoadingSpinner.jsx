import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = ({ message = 'Loading...', fullHeight = false }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      py: fullHeight ? 20 : 8,
    }}
  >
    <CircularProgress />
    {message && <Typography color="text.secondary">{message}</Typography>}
  </Box>
);

export default LoadingSpinner;
