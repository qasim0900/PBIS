import { useDispatch } from 'react-redux';
import { showNotification } from '../pages/uiSlice';
import { useState, useCallback, useEffect } from 'react';

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
        const result = await asyncFunction(...args);
        const responseData = result?.data ?? result;

        setData(responseData);
        setStatus('success');
        return responseData;
      } catch (err) {
        const errorMsg = err?.response?.data?.detail || err?.message || 'An error occurred';
        setError(errorMsg);
        setStatus('error');

        dispatch(showNotification({ message: errorMsg, type: 'error' }));
        throw err;
      }
    },
    [asyncFunction, dispatch]
  );

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  const isLoading = status === 'pending';

  return { execute, status, data, error, isLoading };
};

export default useAsync;
