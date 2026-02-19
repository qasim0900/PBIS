import React, { useCallback, useMemo } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification, selectNotification } from '../api/uiSlice';

//---------------------------------------
// :: Notification Function
//---------------------------------------

/*
A notification component that displays success or error messages in a top-right Snackbar with auto-hide, 
slide transition, and customizable styling.
*/

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  //---------------------------------------
  // :: Handle Close Function
  //---------------------------------------

  /*
  A callback that closes the notification by dispatching the `hideNotification` action.
  */

  const handleClose = useCallback(() => {
    dispatch(hideNotification());
  }, [dispatch]);


  //---------------------------------------
  // :: isVisible Function
  //---------------------------------------

  /*
  A memoized value that determines if a notification should be visible, showing only when its type is `'success'` or `'error'`.
  */

  const isVisible = useMemo(
    () =>
      notification &&
      (notification.type === 'success' || notification.type === 'error'),
    [notification]
  );

  if (!isVisible) return null;


  //---------------------------------------
  // :: auto Hide Duration
  //---------------------------------------

  /*
  Sets the notification’s auto-hide duration, defaulting to 6000 milliseconds if no duration is specified.
  */

  const autoHideDuration = notification?.duration ?? 6000;


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders a top-right `Snackbar` with a sliding transition containing a styled `Alert` that shows the 
  notification message and auto-hides after a set duration.
  */

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


//---------------------------------------
// :: Export Memo Notification
//---------------------------------------

/*
Exports the `Notification` component wrapped in `React.memo` to optimise performance by preventing unnecessary re-renders.
*/

export default React.memo(Notification);
