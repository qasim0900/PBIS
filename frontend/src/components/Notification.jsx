import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification, selectNotification } from '../store/slices/uiSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const handleClose = () => dispatch(hideNotification());

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification?.duration || 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Slide}
      sx={{ mt: 8 }} // AppBar ke neeche aaye
    >
      <Alert
        onClose={handleClose}
        severity={notification?.type || 'info'}
        variant="filled"
        sx={{
          minWidth: 300,
          fontSize: '1rem',
          fontWeight: 500,
          borderRadius: 2,
          boxShadow: 6,
        }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
};

export default React.memo(Notification);