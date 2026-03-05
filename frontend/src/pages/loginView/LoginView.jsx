import { useDispatch } from 'react-redux';
import LoginDesign from './LoginDesign.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../../api/uiSlice.js';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/counts', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!username || !password) {
        dispatch(showNotification({ 
          message: 'Please enter both username and password.', 
          type: 'error' 
        }));
        return;
      }
      const result = await login(username, password);
      if (result.success) {
        dispatch(showNotification({ 
          message: 'Welcome back! Login successful.', 
          type: 'success' 
        }));
        navigate('/counts', { replace: true });
      } else {
        dispatch(showNotification({ 
          message: result.error || 'Invalid credentials. Please try again.', 
          type: 'error' 
        }));
      }
    },
    [login, username, password, navigate, dispatch]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
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
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;
