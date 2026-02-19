import { useDispatch } from 'react-redux';
import LoginDesign from './LoginDesign.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../../api/uiSlice.js';
import { useState, useEffect, useCallback } from 'react';


//---------------------------------------
// :: Login Function 
//---------------------------------------


/*
A functional login component that manages user credentials, handles authentication, displays notifications, 
and redirects authenticated users to the counts page.
*/

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();

  //---------------------------------------
  // :: useEffect Auth 
  //---------------------------------------


  /*
  Redirects authenticated users to the counts page automatically.
  */

  useEffect(() => {
    if (isAuthenticated) navigate('/counts', { replace: true });
  }, [isAuthenticated, navigate]);


  //---------------------------------------
  // :: handleSubmit Function 
  //---------------------------------------


  /*
  Handles login form submission, authenticates the user, shows a notification, and redirects on success.
  */

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


  //---------------------------------------
  // :: Return Code
  //---------------------------------------


  /*
  Renders the login UI component with controlled form state and handlers for authentication.
  */

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


//---------------------------------------
// :: Export Login 
//---------------------------------------


/*
Renders the login page and handles user authentication with state management and navigation.
*/

export default Login;
