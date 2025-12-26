import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../store/slices/uiSlice';
import { loginUser, selectAuthState, clearError } from '../store/slices/authSlice';

export const useLoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authState = useSelector(selectAuthState);
    const loading = authState?.loading || false;
    const isAuthenticated = authState?.isAuthenticated || !!authState?.token;

    useEffect(() => {
        if (isAuthenticated) navigate('/counts', { replace: true });
    }, [isAuthenticated, navigate]);

    useEffect(() => () => dispatch(clearError()), [dispatch]);

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e) => {
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
    };

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
