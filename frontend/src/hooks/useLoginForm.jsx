import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { showNotification } from '../store/slices/uiSlice';
import { loginUser, selectAuthState, clearError } from '../store/slices/authSlice';

export const useLoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading = false, isAuthenticated = false, token } = useSelector(selectAuthState);
    const authenticated = isAuthenticated || !!token;

    useEffect(() => {
        if (authenticated) navigate('/counts', { replace: true });
    }, [authenticated, navigate]);

    useEffect(() => {
        return () => dispatch(clearError());
    }, [dispatch]);

    const togglePassword = useCallback(() => setShowPassword((prev) => !prev), []);

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
