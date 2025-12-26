import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../pages/uiSlice';

export const useAsync = (asyncFunction, immediate = true) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setData(null);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response?.data || response);
        setStatus('success');
        return response?.data || response;
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || 'An error occurred';
        setError(errorMsg);
        setStatus('error');
        dispatch(showNotification({ message: errorMsg, type: 'error' }));
        throw err;
      }
    },
    [asyncFunction, dispatch]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error, isLoading: status === 'pending' };
};

export default useAsync;
