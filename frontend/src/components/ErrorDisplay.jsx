import { memo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Box, Typography, Button, Alert } from '@mui/material';


//---------------------------------------
// :: Error Alert With Message
//---------------------------------------

/*
A React component that shows an error alert with a message, optional icon, and an optional retry button callback.
*/

/**
 * ErrorDisplay Component
 * Displays an error message with optional retry button
 *
 * @param {string|Error} error - Error message or object
 * @param {Function} onRetry - Optional retry callback
 * @param {boolean} showIcon - Whether to show the error icon
 */


//---------------------------------------
// :: Error Display Function
//---------------------------------------

/*
A React component that conditionally displays an error alert with a message, optional icon, and a retry button if `onRetry` is provided.
*/

const ErrorDisplay = ({ error, onRetry, showIcon = true }) => {
  if (!error) return null;

  const message =
    typeof error === 'string'
      ? error
      : error?.message || 'An error occurred';

  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders a styled error alert with a bold "Error" title, the error message, an optional icon, 
  and an optional retry button if `onRetry` is provided.
  */

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

//---------------------------------------
// :: Export Memo Error Display
//---------------------------------------

/*
Exports the `ErrorDisplay` component wrapped in `React.memo` to prevent unnecessary re-renders when its props haven’t changed.
*/

export default memo(ErrorDisplay);
