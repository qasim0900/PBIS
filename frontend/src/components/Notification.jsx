import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification, selectNotification } from '../pages/uiSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const handleClose = () => dispatch(hideNotification());
  if (!notification || (notification.type !== 'success' && notification.type !== 'error')) {
    return null;
  }

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification?.duration || 6000}
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
