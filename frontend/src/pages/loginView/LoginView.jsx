import LoginDesign from './LoginDesign.jsx';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../../api/uiSlice.js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/counts', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const result = await login(username, password);
      if (result.success) {
        dispatch(showNotification({ message: 'Login successful!', type: 'success' }));
        navigate('/counts', { replace: true });
      } else {
        dispatch(showNotification({ message: result.error || 'Invalid credentials', type: 'error' }));
      }
    },
    [login, username, password, navigate, dispatch]
  );

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
