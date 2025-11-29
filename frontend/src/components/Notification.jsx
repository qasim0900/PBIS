import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Slide } from '@mui/material';
import { selectNotification, hideNotification } from '../store/slices/uiSlice';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    dispatch(hideNotification());
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification.duration || 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type || 'info'}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
