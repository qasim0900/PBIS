import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { showNotification } from '../store/slices/uiSlice';
import { loginUser, selectAuthState, clearError } from '../store/slices/authSlice';

//---------------------------------------
// :: useLoginForm Function
//---------------------------------------

/*
A custom React hook managing login form state, authentication, password visibility, submission, and notifications.
*/


export const useLoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading = false, isAuthenticated = false, token } = useSelector(selectAuthState);
    const authenticated = isAuthenticated || !!token;

    //---------------------------------------
    // :: useEffect Redirect Function
    //---------------------------------------

    /*
    Redirects the user to `/counts` if already authenticated.
    */

    useEffect(() => {
        if (authenticated) navigate('/counts', { replace: true });
    }, [authenticated, navigate]);


    //---------------------------------------
    // :: useEffect Clear Auth Function
    //---------------------------------------

    /*
    Clears authentication errors when the component unmounts.
    */

    useEffect(() => {
        return () => dispatch(clearError());
    }, [dispatch]);


    //---------------------------------------
    // :: togglePassword Function
    //---------------------------------------

    /*
    Toggles the password visibility on or off.
    */

    const togglePassword = useCallback(() => setShowPassword((prev) => !prev), []);


    //---------------------------------------
    // :: handleSubmit Function
    //---------------------------------------

    /*
    Handles form submission: logs in the user, shows success/error notifications, and redirects on success.
    */

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                await dispatch(loginUser({ username, password })).unwrap();
                dispatch(showNotification({ message: 'Login successful!', type: 'success' }));
                navigate('/counts', { replace: true });
            } catch (err) {
                dispatch(
                    showNotification({ message: err?.message || 'Invalid credentials', type: 'error' })
                );
            }
        },
        [username, password, dispatch, navigate]
    );


    //---------------------------------------
    // :: Return Code
    //---------------------------------------

    /*
    Returns login form state, handlers, password toggle, loading status, and submit function.
    */

    return {
        username,
        setUsername,
        password,
        setPassword,
        showPassword,
        togglePassword,
        loading,
        handleSubmit,
    };
};
