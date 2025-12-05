import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Slide } from '@mui/material';
import { selectNotification, hideNotification } from '../store/slices/uiSlice';

/**
 * Slide transition for Snackbar
 */
const SlideTransition = (props) => <Slide {...props} direction="up" />;

/**
 * Notification component to display global alerts
 */
const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  // Close handler
  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    dispatch(hideNotification());
  }, [dispatch]);

  // Nothing to show
  if (!notification?.message) return null;

  const { type = 'info', message, duration = 5000 } = notification;

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          fontWeight: 500,
        }}
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(Notification);
