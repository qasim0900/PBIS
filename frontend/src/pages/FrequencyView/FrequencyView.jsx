import FrequencyDesign from './FrequencyDesign.jsx';
import AppLoading from '../../components/AppLoading';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import { useEffect, useState, useCallback } from 'react';
import { fetchFrequencies, createFrequency, updateFrequency } from './frequencySlice.js';


//---------------------------------------
// :: DEFAULT_FORM List
//---------------------------------------


/*
Defines the default form values for creating or editing a frequency entry.
*/

const DEFAULT_FORM = {
  frequency_name: '',
  description: '',
};


//---------------------------------------
// :: FrequencyView Function
//---------------------------------------

/*
Manages frequency data by fetching, creating, and updating frequency records, and passes state to the FrequencyDesign UI.
*/

const FrequencyView = () => {
  const dispatch = useDispatch();
  const { frequencies, loading } = useSelector((state) => state.frequencies);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);


  //---------------------------------------
  // :: useEffect Dispatch Function
  //---------------------------------------

  /*
  Fetches frequency data from the server when the component mounts.
  */

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


  //---------------------------------------
  // :: openDialog Function
  //---------------------------------------

  /*
  Opens the dialog and sets form data for editing if a frequency is provided, otherwise loads default form values.
  */

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


  //---------------------------------------
  // :: closeDialog Function
  //---------------------------------------

  /*
  Closes the dialog, resets editing state, and clears the form to default values.
  */

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);


  //---------------------------------------
  // :: handleSubmit Function
  //---------------------------------------

  /*
  Saves a new or existing frequency, shows a notification, refreshes the list, and closes the dialog
  */

  const handleSubmit = useCallback(async (payload) => {
    // Comprehensive validation
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
      
      // Handle field-specific errors
      if (err.fieldErrors) {
        const errorMessages = Object.entries(err.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        
        dispatch(showNotification({
          message: errorMessages || 'Validation failed',
          type: 'error'
        }));
      } else {
        // Handle general errors
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


  //---------------------------------------
  // :: Return Code
  //---------------------------------------


  /*
  Passing state and handlers from the container to the FrequencyDesign component for rendering.
  */

  // Show loading screen when initial data is being fetched
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


//---------------------------------------
// :: Export FrequencyView
//---------------------------------------

/*
A container component that manages frequency data and actions, then renders the `FrequencyDesign` UI.
*/

export default FrequencyView;
