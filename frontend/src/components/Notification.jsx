import React, { useCallback, useMemo } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification, selectNotification } from '../api/uiSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const handleClose = useCallback(() => {
    dispatch(hideNotification());
  }, [dispatch]);

  const isVisible = useMemo(
    () =>
      notification &&
      (notification.type === 'success' || notification.type === 'error'),
    [notification]
  );

  if (!isVisible) return null;

  const autoHideDuration = notification?.duration ?? 6000;

  return (
    <Snackbar
      open
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Slide}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type}
        variant="filled"
        sx={{
          minWidth: 300,
          fontSize: '1rem',
          fontWeight: 500,
          borderRadius: 2,
          boxShadow: 6,
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default React.memo(Notification);
