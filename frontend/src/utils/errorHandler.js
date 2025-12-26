export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data)) {
      return data[0]?.message || data[0] || 'An error occurred';
    }
    if (typeof data === 'object') {
      return Object.values(data)[0] || 'An error occurred';
    }
  }

  if (error?.message) return error.message;
  
  return 'An unexpected error occurred';
};

export const handleAPIError = (error, dispatch, showNotification) => {
  const message = getErrorMessage(error);
  dispatch(showNotification({ message, type: 'error' }));
  return message;
};

export default {
  getErrorMessage,
  handleAPIError,
};
