import { AlertCircle } from 'lucide-react';
import { Box, Typography, Button, Alert } from '@mui/material';

export const ErrorDisplay = ({ error, onRetry, showIcon = true }) => {
  if (!error) return null;

  return (
    <Alert
      severity="error"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        borderRadius: 2,
      }}
      icon={showIcon ? <AlertCircle size={20} /> : false}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Error
        </Typography>
        <Typography variant="body2" color="inherit" sx={{ mt: 0.5 }}>
          {typeof error === 'string' ? error : error.message || 'An error occurred'}
        </Typography>
      </Box>
      {onRetry && (
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          onClick={onRetry}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Retry
        </Button>
      )}
    </Alert>
  );
};

export default ErrorDisplay;
