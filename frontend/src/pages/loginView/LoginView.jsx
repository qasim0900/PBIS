import LoginDesign from './LoginDesign.jsx';
import { useState, useEffect } from 'react';
import { showNotification } from '../uiSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthState, clearError } from './authSlice.js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authState = useSelector(selectAuthState);
  const loading = authState?.loading || false;
  const isAuthenticated = authState?.isAuthenticated || !!authState?.token;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/counts');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginUser({ username, password })).unwrap();
      dispatch(showNotification({ message: 'Login successful!', type: 'success' }));
      navigate('/counts', { replace: true });
    } catch (err) {
      dispatch(showNotification({ message: err?.message || 'Invalid credentials', type: 'error' }));
    }
  };

  return (
    <LoginDesign
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default Login;
