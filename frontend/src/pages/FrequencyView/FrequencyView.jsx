import FrequencyDesign from './FrequencyDesign.jsx';
import AppLoading from '../../components/AppLoading';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import { useEffect, useState, useCallback } from 'react';
import { fetchFrequencies, createFrequency, updateFrequency } from './frequencySlice.js';

const DEFAULT_FORM = {
  frequency_name: '',
  description: '',
};

const FrequencyView = () => {
  const dispatch = useDispatch();
  const { frequencies, loading } = useSelector((state) => state.frequencies);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    dispatch(fetchFrequencies())
      .unwrap()
      .catch((err) => {
        console.error('Fetch frequencies error:', err);
        const errorMessage = err?.message || 
                            err?.detail || 
                            'Failed to load Inventory Lists. Please refresh the page.';
        dispatch(showNotification({ 
          message: errorMessage, 
          type: 'error' 
        }));
      });
  }, [dispatch]);

  const openDialog = useCallback((frequency = null) => {
    setEditing(frequency);
    setFormData(
      frequency
        ? {
          frequency_name: frequency.frequency_name || '',
          description: frequency.description || '',
        }
        : DEFAULT_FORM
    );
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);

  const handleSubmit = useCallback(async (payload) => {
    if (!payload.frequency_name || !payload.frequency_name.trim()) {
      dispatch(showNotification({ 
        message: 'Inventory List name is required', 
        type: 'error' 
      }));
      return;
    }

    if (payload.frequency_name.trim().length < 2) {
      dispatch(showNotification({ 
        message: 'Inventory List name must be at least 2 characters long', 
        type: 'error' 
      }));
      return;
    }

    if (payload.frequency_name.trim().length > 100) {
      dispatch(showNotification({ 
        message: 'Inventory List name must be 100 characters or less', 
        type: 'error' 
      }));
      return;
    }

    const cleanPayload = {
      frequency_name: payload.frequency_name.trim(),
      description: payload.description?.trim() || '',
    };

    try {
      if (editing) {
        await dispatch(updateFrequency({ id: editing.id, data: cleanPayload })).unwrap();
        dispatch(showNotification({ 
          message: `✓ Inventory List "${cleanPayload.frequency_name}" updated successfully`, 
          type: 'success' 
        }));
      } else {
        await dispatch(createFrequency(cleanPayload)).unwrap();
        dispatch(showNotification({ 
          message: `✓ Inventory List "${cleanPayload.frequency_name}" created successfully`, 
          type: 'success' 
        }));
      }
      closeDialog();
      dispatch(fetchFrequencies());
    } catch (err) {
      console.error('Frequency save error:', err);
      
      if (err.fieldErrors) {
        const errorMessages = Object.entries(err.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        
        dispatch(showNotification({
          message: errorMessages || 'Validation failed',
          type: 'error'
        }));
      } else {
        const errorMessage = 
          err?.message ||
          err?.frequency_name?.[0] ||
          err?.detail ||
          'Unable to save Inventory List. Please try again.';
        
        dispatch(showNotification({
          message: errorMessage,
          type: 'error'
        }));
      }
    }
  }, [dispatch, editing, closeDialog]);

  if (loading && frequencies.length === 0) {
    return <AppLoading />;
  }

  return (
    <FrequencyDesign
      frequencies={frequencies}
      loading={loading}
      open={open}
      editing={editing}
      formData={formData}
      setFormData={setFormData}
      openDialog={openDialog}
      closeDialog={closeDialog}
      handleSubmit={handleSubmit}
    />
  );
};

export default FrequencyView;
