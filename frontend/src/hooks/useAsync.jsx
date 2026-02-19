import { useDispatch } from 'react-redux';
import { showNotification } from '../pages/uiSlice';
import { useState, useCallback, useEffect } from 'react';


//---------------------------------------
// :: Manage Asyc Operations
//---------------------------------------

/*
Custom hook to manage async operations with loading, success, and error states, including automatic error notifications.
*/

/**
 * Custom hook for handling async functions with loading, success, and error states.
 * Automatically shows notifications on error.
 *
 * @param {Function} asyncFunction - The async function to execute.
 * @param {boolean} immediate - Whether to execute immediately on mount.
 */

//---------------------------------------
// :: Use Async Function
//---------------------------------------

/*
Custom React hook to handle async functions with loading, success, error states, and automatic error notifications.
*/

export const useAsync = (asyncFunction, immediate = true) => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);


  //---------------------------------------
  // :: Execute async function
  //---------------------------------------

  /*
  `execute` is a memoized function that runs the async function, manages loading, success, and error states,
   and dispatches an error notification if it fails.
  */

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


  //---------------------------------------
  // :: Execute immediately mount Function
  //---------------------------------------

  /*
  Runs the `execute` function immediately on mount if `immediate` is `true`.
  */

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);


  //---------------------------------------
  // :: Is Loading Variable
  //---------------------------------------

  /*
  Derives a boolean `isLoading` that’s `true` while the async function is running.
  */

  const isLoading = status === 'pending';

  return { execute, status, data, error, isLoading };
};


//---------------------------------------
// :: Export Use Async 
//---------------------------------------

/*
Exports the `useAsync` hook for handling async operations with loading, success, and error states.
*/

export default useAsync;
