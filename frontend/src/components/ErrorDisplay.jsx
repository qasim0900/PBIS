import { memo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Box, Typography, Button, Alert } from '@mui/material';

const ErrorDisplay = ({ error, onRetry, showIcon = true }) => {
  if (!error) return null;

  const message =
    typeof error === 'string'
      ? error
      : error?.message || 'An error occurred';

  return (
    <Alert
      severity="error"
      icon={showIcon ? <AlertCircle size={20} /> : false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        borderRadius: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Error
        </Typography>
        <Typography variant="body2" color="inherit" sx={{ mt: 0.5 }}>
          {message}
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

export default memo(ErrorDisplay);
